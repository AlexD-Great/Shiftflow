-- CreateTable
CREATE TABLE "GuestWorkflow" (
    "id" TEXT NOT NULL,
    "sessionId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "conditions" JSONB NOT NULL,
    "actions" JSONB NOT NULL,
    "userAgent" TEXT,
    "ipAddress" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "GuestWorkflow_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WorkflowAnalytics" (
    "id" TEXT NOT NULL,
    "eventType" TEXT NOT NULL,
    "workflowData" JSONB NOT NULL,
    "sessionId" TEXT,
    "userId" TEXT,
    "userAgent" TEXT,
    "ipAddress" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "WorkflowAnalytics_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "GuestWorkflow_sessionId_idx" ON "GuestWorkflow"("sessionId");

-- CreateIndex
CREATE INDEX "GuestWorkflow_createdAt_idx" ON "GuestWorkflow"("createdAt");

-- CreateIndex
CREATE INDEX "WorkflowAnalytics_eventType_idx" ON "WorkflowAnalytics"("eventType");

-- CreateIndex
CREATE INDEX "WorkflowAnalytics_sessionId_idx" ON "WorkflowAnalytics"("sessionId");

-- CreateIndex
CREATE INDEX "WorkflowAnalytics_userId_idx" ON "WorkflowAnalytics"("userId");

-- CreateIndex
CREATE INDEX "WorkflowAnalytics_createdAt_idx" ON "WorkflowAnalytics"("createdAt");
