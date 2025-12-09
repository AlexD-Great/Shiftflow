import { prisma } from "@/lib/prisma";

/**
 * Notification Service
 * Handles email and webhook notifications for workflow executions
 */
export class NotificationService {
  /**
   * Send notification when workflow execution completes
   */
  async notifyWorkflowExecution(
    userId: string,
    workflowName: string,
    executionId: string,
    status: "success" | "failed",
    details: any
  ): Promise<void> {
    try {
      // Create in-app notification
      await this.createInAppNotification(userId, workflowName, status, details);

      // Send email notification (if user has email)
      await this.sendEmailNotification(userId, workflowName, status, details);

      // Trigger webhooks (if configured)
      await this.triggerWebhooks(userId, workflowName, executionId, status, details);

      console.log(`[Notification Service] Notifications sent for execution ${executionId}`);
    } catch (error) {
      console.error("[Notification Service] Error sending notifications:", error);
      // Don't throw - notifications are non-critical
    }
  }

  /**
   * Create in-app notification
   */
  private async createInAppNotification(
    userId: string,
    workflowName: string,
    status: "success" | "failed",
    details: any
  ): Promise<void> {
    const type = status === "success" ? "WORKFLOW_EXECUTED" : "WORKFLOW_FAILED";
    const title = status === "success" 
      ? `✅ Workflow "${workflowName}" Executed Successfully`
      : `❌ Workflow "${workflowName}" Failed`;
    
    const message = status === "success"
      ? `Your workflow has been executed successfully. ${details.shiftId ? `Shift ID: ${details.shiftId}` : ""}`
      : `Your workflow execution failed. Error: ${details.error || "Unknown error"}`;

    await prisma.notification.create({
      data: {
        userId,
        type,
        title,
        message,
        data: details,
      },
    });

    console.log(`[Notification Service] In-app notification created for user ${userId}`);
  }

  /**
   * Send email notification
   */
  private async sendEmailNotification(
    userId: string,
    workflowName: string,
    status: "success" | "failed",
    details: any
  ): Promise<void> {
    // Get user email
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { email: true, name: true },
    });

    if (!user?.email) {
      console.log(`[Notification Service] No email found for user ${userId}, skipping email`);
      return;
    }

    // For now, log email content (in production, integrate with SendGrid, Resend, etc.)
    const emailContent = this.generateEmailContent(
      user.name || "User",
      workflowName,
      status,
      details
    );

    console.log(`[Notification Service] Email notification prepared for ${user.email}`);
    console.log(`Subject: ${emailContent.subject}`);
    console.log(`Body: ${emailContent.body}`);

    // TODO: Integrate with email service provider
    // Example with Resend:
    // await resend.emails.send({
    //   from: 'ShiftFlow <notifications@shiftflow.app>',
    //   to: user.email,
    //   subject: emailContent.subject,
    //   html: emailContent.html,
    // });
  }

  /**
   * Generate email content
   */
  private generateEmailContent(
    userName: string,
    workflowName: string,
    status: "success" | "failed",
    details: any
  ): { subject: string; body: string; html: string } {
    const subject = status === "success"
      ? `✅ Workflow "${workflowName}" Executed Successfully`
      : `❌ Workflow "${workflowName}" Failed`;

    const body = status === "success"
      ? `Hi ${userName},\n\nYour workflow "${workflowName}" has been executed successfully!\n\n${
          details.shiftId 
            ? `Shift ID: ${details.shiftId}\nDeposit Address: ${details.depositAddress}\nAmount: ${details.depositAmount} ${details.depositCoin}\n` 
            : ""
        }\nView details: https://shiftflow-web.vercel.app/dashboard\n\nBest regards,\nShiftFlow Team`
      : `Hi ${userName},\n\nYour workflow "${workflowName}" execution failed.\n\nError: ${details.error || "Unknown error"}\n\nPlease check your workflow configuration and try again.\n\nView details: https://shiftflow-web.vercel.app/dashboard\n\nBest regards,\nShiftFlow Team`;

    const html = status === "success"
      ? `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #10b981;">✅ Workflow Executed Successfully</h2>
          <p>Hi ${userName},</p>
          <p>Your workflow <strong>"${workflowName}"</strong> has been executed successfully!</p>
          ${details.shiftId ? `
            <div style="background: #f3f4f6; padding: 15px; border-radius: 8px; margin: 20px 0;">
              <p><strong>Shift ID:</strong> ${details.shiftId}</p>
              <p><strong>Deposit Address:</strong> <code>${details.depositAddress}</code></p>
              <p><strong>Amount:</strong> ${details.depositAmount} ${details.depositCoin}</p>
              <p><strong>Settle Amount:</strong> ${details.settleAmount} ${details.settleCoin}</p>
            </div>
          ` : ""}
          <p><a href="https://shiftflow-web.vercel.app/dashboard" style="background: #3b82f6; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block;">View Dashboard</a></p>
          <p style="color: #6b7280; font-size: 12px; margin-top: 30px;">Best regards,<br>ShiftFlow Team</p>
        </div>
      `
      : `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #ef4444;">❌ Workflow Execution Failed</h2>
          <p>Hi ${userName},</p>
          <p>Your workflow <strong>"${workflowName}"</strong> execution failed.</p>
          <div style="background: #fef2f2; padding: 15px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #ef4444;">
            <p><strong>Error:</strong> ${details.error || "Unknown error"}</p>
          </div>
          <p>Please check your workflow configuration and try again.</p>
          <p><a href="https://shiftflow-web.vercel.app/dashboard" style="background: #3b82f6; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block;">View Dashboard</a></p>
          <p style="color: #6b7280; font-size: 12px; margin-top: 30px;">Best regards,<br>ShiftFlow Team</p>
        </div>
      `;

    return { subject, body, html };
  }

  /**
   * Trigger webhooks
   */
  private async triggerWebhooks(
    userId: string,
    workflowName: string,
    executionId: string,
    status: "success" | "failed",
    details: any
  ): Promise<void> {
    // Get user's webhook configurations
    // For now, we'll check if webhooks are configured in workflow actions
    // In production, you'd have a separate WebhookConfig model

    const payload = {
      event: status === "success" ? "workflow.executed" : "workflow.failed",
      workflowName,
      executionId,
      status,
      timestamp: new Date().toISOString(),
      data: details,
    };

    console.log(`[Notification Service] Webhook payload prepared:`, payload);

    // TODO: Implement webhook delivery
    // This would:
    // 1. Get webhook URLs from user config
    // 2. Send POST requests with payload
    // 3. Handle retries on failure
    // 4. Log webhook delivery status
  }

  /**
   * Send condition met notification
   */
  async notifyConditionMet(
    userId: string,
    workflowName: string,
    conditionDetails: any
  ): Promise<void> {
    try {
      await prisma.notification.create({
        data: {
          userId,
          type: "CONDITION_MET",
          title: `🎯 Conditions Met for "${workflowName}"`,
          message: `Your workflow conditions have been met and execution is starting.`,
          data: conditionDetails,
        },
      });

      console.log(`[Notification Service] Condition met notification created for user ${userId}`);
    } catch (error) {
      console.error("[Notification Service] Error creating condition notification:", error);
    }
  }

  /**
   * Get user notifications
   */
  async getUserNotifications(userId: string, limit: number = 50): Promise<any[]> {
    return prisma.notification.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      take: limit,
    });
  }

  /**
   * Mark notification as read
   */
  async markAsRead(notificationId: string): Promise<void> {
    await prisma.notification.update({
      where: { id: notificationId },
      data: { read: true },
    });
  }

  /**
   * Mark all notifications as read
   */
  async markAllAsRead(userId: string): Promise<void> {
    await prisma.notification.updateMany({
      where: { userId, read: false },
      data: { read: true },
    });
  }
}
