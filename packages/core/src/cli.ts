#!/usr/bin/env node
import * as fs from 'fs';
import * as path from 'path';
import { WorkflowEngine } from './engine/workflow';
import { Workflow } from './types';

const args = process.argv.slice(2);
const command = args[0];

function printHelp() {
  console.log(`
Agent Workflow Orchestrator CLI

Usage:
  agent-orchestrator <command> [options]

Commands:
  run <workflow.json> [input.json]     Run a workflow
  validate <workflow.json>             Validate workflow syntax
  serve [port]                         Start API server (default: 3001)
  list-templates                       List built-in templates

Examples:
  agent-orchestrator run templates/customer-service.json '{"input":"Hello"}'
  agent-orchestrator validate my-workflow.json
  agent-orchestrator serve 8080
`);
}

async function runWorkflow(filePath: string, inputStr?: string) {
  const engine = new WorkflowEngine();
  const content = fs.readFileSync(filePath, 'utf-8');
  const workflow: Workflow = JSON.parse(content);

  const errors = engine.validate(workflow);
  if (errors.length > 0) {
    console.error('Validation errors:', errors);
    process.exit(1);
  }

  engine.register(workflow);

  let variables: Record<string, unknown> = {};
  if (inputStr) {
    try {
      variables = JSON.parse(inputStr);
    } catch {
      variables = { input: inputStr };
    }
  }

  console.log(`Running workflow: ${workflow.name}...\n`);
  const result = await engine.run(workflow.id, variables);

  console.log('\n=== Execution Result ===');
  console.log(`Status: ${result.status}`);
  console.log(`Run ID: ${result.runId}`);
  console.log(`Duration: ${result.endTime ? result.endTime.getTime() - result.startTime.getTime() : 0}ms`);
  console.log('\nOutputs:');
  console.log(JSON.stringify(result.outputs, null, 2));

  if (result.error) {
    console.error('\nError:', result.error);
    process.exit(1);
  }
}

function validateWorkflow(filePath: string) {
  const engine = new WorkflowEngine();
  const content = fs.readFileSync(filePath, 'utf-8');
  const workflow: Workflow = JSON.parse(content);

  const errors = engine.validate(workflow);
  if (errors.length === 0) {
    console.log('Workflow is valid!');
  } else {
    console.error('Validation errors:');
    errors.forEach(e => console.error(`  - ${e}`));
    process.exit(1);
  }
}

async function startServer(port = 3001) {
  const engine = new WorkflowEngine();

  // Load all templates
  const templatesDir = path.join(process.cwd(), 'templates');
  if (fs.existsSync(templatesDir)) {
    const files = fs.readdirSync(templatesDir).filter(f => f.endsWith('.json'));
    for (const file of files) {
      try {
        const content = fs.readFileSync(path.join(templatesDir, file), 'utf-8');
        const workflow: Workflow = JSON.parse(content);
        engine.register(workflow);
      } catch (e) {
        console.warn(`Failed to load template ${file}:`, e);
      }
    }
  }

  const server = require('http').createServer(async (req: any, res: any) => {
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
      res.writeHead(200);
      res.end();
      return;
    }

    const url = new URL(req.url, `http://localhost:${port}`);

    try {
      if (url.pathname === '/api/workflows' && req.method === 'GET') {
        const workflows = engine.list().map(w => ({ id: w.id, name: w.name, description: w.description }));
        res.writeHead(200);
        res.end(JSON.stringify({ workflows }));
      } else if (url.pathname === '/api/workflows' && req.method === 'POST') {
        let body = '';
        req.on('data', (chunk: Buffer) => { body += chunk; });
        req.on('end', () => {
          try {
            const workflow: Workflow = JSON.parse(body);
            engine.register(workflow);
            res.writeHead(201);
            res.end(JSON.stringify({ success: true, id: workflow.id }));
          } catch (e) {
            res.writeHead(400);
            res.end(JSON.stringify({ error: 'Invalid workflow JSON' }));
          }
        });
      } else if (url.pathname.match(/^\/api\/workflows\/[^/]+\/run$/) && req.method === 'POST') {
        const workflowId = url.pathname.split('/')[3];
        let body = '';
        req.on('data', (chunk: Buffer) => { body += chunk; });
        req.on('end', async () => {
          try {
            const variables = body ? JSON.parse(body) : {};
            const result = await engine.run(workflowId, variables);
            res.writeHead(200);
            res.end(JSON.stringify(result));
          } catch (e) {
            res.writeHead(500);
            res.end(JSON.stringify({ error: e instanceof Error ? e.message : String(e) }));
          }
        });
      } else if (url.pathname === '/api/health') {
        res.writeHead(200);
        res.end(JSON.stringify({ status: 'ok', workflows: engine.list().length }));
      } else {
        res.writeHead(404);
        res.end(JSON.stringify({ error: 'Not found' }));
      }
    } catch (e) {
      res.writeHead(500);
      res.end(JSON.stringify({ error: e instanceof Error ? e.message : String(e) }));
    }
  });

  server.listen(port, () => {
    console.log(`Agent Workflow Orchestrator API server running on http://localhost:${port}`);
    console.log(`API Endpoints:`);
    console.log(`  GET  /api/workflows         List workflows`);
    console.log(`  POST /api/workflows         Create workflow`);
    console.log(`  POST /api/workflows/:id/run Run workflow`);
    console.log(`  GET  /api/health            Health check`);
  });
}

function listTemplates() {
  const templatesDir = path.join(process.cwd(), 'templates');
  if (!fs.existsSync(templatesDir)) {
    console.log('No templates directory found');
    return;
  }
  const files = fs.readdirSync(templatesDir).filter(f => f.endsWith('.json'));
  console.log('Built-in templates:');
  for (const file of files) {
    try {
      const content = fs.readFileSync(path.join(templatesDir, file), 'utf-8');
      const workflow = JSON.parse(content);
      console.log(`  ${file.replace('.json', '')}: ${workflow.name}`);
    } catch {
      console.log(`  ${file}: (invalid)`);
    }
  }
}

(async () => {
  switch (command) {
    case 'run':
      if (!args[1]) { console.error('Usage: run <workflow.json> [input.json]'); process.exit(1); }
      await runWorkflow(args[1], args[2]);
      break;
    case 'validate':
      if (!args[1]) { console.error('Usage: validate <workflow.json>'); process.exit(1); }
      validateWorkflow(args[1]);
      break;
    case 'serve':
      await startServer(args[1] ? parseInt(args[1]) : undefined);
      break;
    case 'list-templates':
      listTemplates();
      break;
    default:
      printHelp();
  }
})();
