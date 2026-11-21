/**
 * System & Integration: Scheduled Jobs / Cron
 * -------------------------------------------------------------
 * Concepts Demonstrated:
 * - Time-based task scheduling (cron syntax: "* /5 * * * *")
 * - Automated background tasks:
 *   * Hourly sensor telemetry ingestion and risk recalculation
 *   * Daily municipal CapEx reconciliation and audit log rotation
 * - Concurrency control & job execution monitoring
 */

export interface CronJobStatus {
  name: string;
  schedule: string;
  lastRun?: Date;
  nextRun?: Date;
  executionCount: number;
  isRunning: boolean;
}

export class ScheduledJobsManager {
  private jobs = new Map<string, CronJobStatus>();

  constructor() {
    this.registerStandardJobs();
  }

  private registerStandardJobs() {
    this.registerJob('hourly-telemetry-sync', '0 * * * *');
    this.registerJob('daily-budget-reconciliation', '0 0 * * *');
    this.registerJob('audit-log-archival', '0 2 * * 0'); // Every Sunday at 2 AM
  }

  public registerJob(name: string, schedule: string): void {
    this.jobs.set(name, {
      name,
      schedule,
      executionCount: 0,
      isRunning: false,
    });
  }

  public async triggerJob(name: string): Promise<{ success: boolean; durationMs: number }> {
    const job = this.jobs.get(name);
    if (!job) {
      throw new Error(`Job '${name}' not found in registry`);
    }

    const start = performance.now();
    job.isRunning = true;

    // Simulate work performed during scheduled task
    await new Promise((resolve) => setTimeout(resolve, 20));

    job.lastRun = new Date();
    job.executionCount++;
    job.isRunning = false;

    const durationMs = Number((performance.now() - start).toFixed(2));
    return { success: true, durationMs };
  }

  public getJobStatuses(): CronJobStatus[] {
    return Array.from(this.jobs.values());
  }
}

export const cronManager = new ScheduledJobsManager();
