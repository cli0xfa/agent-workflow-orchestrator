import { Workflow } from '../types';
import { WorkflowExecutor } from './executor';

export class WorkflowEngine {
  private workflows: Map<string, Workflow> = new Map();
  private executor: WorkflowExecutor;

  constructor() {
    this.executor = new WorkflowExecutor();
  }

  register(workflow: Workflow): void {
    this.workflows.set(workflow.id, workflow);
  }

  unregister(id: string): boolean {
    return this.workflows.delete(id);
  }

  get(id: string): Workflow | undefined {
    return this.workflows.get(id);
  }

  list(): Workflow[] {
    return Array.from(this.workflows.values());
  }

  async run(id: string, variables: Record<string, unknown> = {}) {
    const workflow = this.workflows.get(id);
    if (!workflow) {
      throw new Error(`Workflow not found: ${id}`);
    }
    return this.executor.execute(workflow, variables);
  }

  validate(workflow: Workflow): string[] {
    const errors: string[] = [];

    if (!workflow.nodes.some(n => n.type === 'start')) {
      errors.push('Workflow must have a start node');
    }
    if (!workflow.nodes.some(n => n.type === 'end')) {
      errors.push('Workflow must have an end node');
    }

    const nodeIds = new Set(workflow.nodes.map(n => n.id));
    for (const edge of workflow.edges) {
      if (!nodeIds.has(edge.source)) {
        errors.push(`Edge references unknown source node: ${edge.source}`);
      }
      if (!nodeIds.has(edge.target)) {
        errors.push(`Edge references unknown target node: ${edge.target}`);
      }
    }

    return errors;
  }
}
