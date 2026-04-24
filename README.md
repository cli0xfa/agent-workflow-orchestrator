<div align="center">

# 🤖 Agent Workflow Orchestrator

**Lightweight AI Agent workflow orchestration framework**

Node-based visual editor · Multi-agent collaboration · MCP-compatible · Local-first

[English](README.md) · [中文](README.zh.md)

</div>

---

## ✨ Features

- 🔭 **Visual Node Editor** — Drag-and-drop workflow design powered by React Flow
- 🤖 **Multi-Agent Collaboration** — Orchestrate multiple AI agents with shared context
- 🧠 **Memory Management** — Short-term and long-term memory for contextual awareness
- 🔧 **MCP Protocol** — Standardized tool calling compatible with Model Context Protocol
- 🔄 **Multi-Model Support** — OpenAI, Anthropic Claude, DeepSeek, and Ollama (local)
- 🚀 **Single-File Runnable** — A complete workflow engine in one JSON file
- 📦 **5 Built-in Templates** — Customer service, code review, research, content generation, data analysis

## 🚀 Quick Start

### 1. Install

```bash
npm install -g @agent-orchestrator/core
```

### 2. Run a Template

```bash
# List built-in templates
agent-orchestrator list-templates

# Run customer service workflow
agent-orchestrator run templates/customer-service.json '{"input":"I want a refund"}'
```

### 3. Launch Visual Editor

```bash
# Start API server
agent-orchestrator serve 3001

# In another terminal, start the UI
cd packages/ui && npm install && npm run dev
```

Open http://localhost:3000 to design workflows visually.

## 🖼️ Architecture

```
├── Visual Editor (React + React Flow)
├── Workflow Engine (TypeScript)
│   ├── DAG Executor
│   ├── Agent Nodes (LLM calls)
│   ├── Tool Nodes (MCP / HTTP / Custom)
│   ├── Memory Nodes (Short-term / Long-term)
│   └── Condition Nodes (Branching logic)
└── Model Providers
    ├── OpenAI
    ├── Anthropic Claude
    ├── DeepSeek
    └── Ollama (local)
```

## 📋 Templates

| Template | Description | Nodes |
|----------|-------------|-------|
| 📞 [Customer Service](templates/customer-service.json) | Intent classification + specialized agents | 7 |
| 🐛 [Code Review](templates/code-review.json) | Style check + bug detection + suggestions | 6 |
| 🔍 [Research Agent](templates/research-agent.json) | Query expansion + parallel search + synthesis | 8 |
| ✍️ [Content Generator](templates/content-generator.json) | Outline → draft → polish pipeline | 6 |
| 📊 [Data Analyst](templates/data-analyst.json) | Parse → pattern find → visualize → insights | 6 |

## 📝 Workflow JSON Format

```json
{
  "id": "my-workflow",
  "name": "My Workflow",
  "nodes": [
    { "id": "start", "type": "start", "position": { "x": 100, "y": 200 }, "data": { "label": "Start" } },
    { "id": "agent1", "type": "agent", "position": { "x": 300, "y": 200 }, "data": {
      "label": "Agent",
      "model": { "provider": "openai", "model": "gpt-4o-mini" },
      "systemPrompt": "You are a helpful assistant."
    }},
    { "id": "end", "type": "end", "position": { "x": 500, "y": 200 }, "data": { "label": "End" } }
  ],
  "edges": [
    { "id": "e1", "source": "start", "target": "agent1" },
    { "id": "e2", "source": "agent1", "target": "end" }
  ]
}
```

## 🚀 CLI Usage

```bash
# Validate workflow
agent-orchestrator validate workflow.json

# Run with variables
agent-orchestrator run workflow.json '{"input":"hello"}'

# Start API server
agent-orchestrator serve 3001

# List templates
agent-orchestrator list-templates
```

## 🔧 Environment Variables

```bash
export OPENAI_API_KEY="sk-..."
export ANTHROPIC_API_KEY="sk-ant-..."
export DEEPSEEK_API_KEY="sk-..."
# Ollama runs locally by default at http://localhost:11434
```

## 📁 Project Structure

```
agent-workflow-orchestrator/
├── packages/
│   ├── core/          # Workflow engine + CLI
│   └── ui/            # React Flow visual editor
├── templates/         # Built-in workflow templates
├── .github/
│   └── workflows/     # CI/CD
└── README.md
```

## 👨‍💻 Development

```bash
# Clone
git clone https://github.com/cli0xfa/agent-workflow-orchestrator.git
cd agent-workflow-orchestrator

# Install dependencies
npm install

# Build core
npm run build --workspace=packages/core

# Run UI
npm run dev --workspace=packages/ui
```

## 🤝 Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines.

## 📄 License

MIT © [cli0xfa](https://github.com/cli0xfa)
