import { useState, useCallback } from 'react';
import { NodesPanel } from './NodesPanel';
import { NodeCanvas } from './NodeCanvas';
import { AIAgentPanel } from './AIAgentPanel';
import { NODE_TEMPLATES, DEFAULT_TEMPLATES, uid, type CanvasNode, type Connection, type NodeTemplate, type AgentMessage } from '../types/canvas';
import type { APIKeys } from '../types/models';

interface Props { apiKeys: APIKeys }

export function CanvasTab({ apiKeys }: Props) {
  const [nodes, setNodes] = useState<CanvasNode[]>([]);
  const [connections, setConnections] = useState<Connection[]>([]);
  const [agentMessages, setAgentMessages] = useState<AgentMessage[]>([]);

  const addNode = useCallback((template: NodeTemplate, x: number, y: number) => {
    const node: CanvasNode = {
      id: uid(), type: template.type, label: template.label, category: template.category,
      x: x || 200 + Math.random() * 200, y: y || 150 + Math.random() * 150,
      ports: template.ports.map(p => ({ ...p })), data: { ...template.defaultData }, width: template.width,
    };
    setNodes(prev => [...prev, node]);
  }, []);

  const handleAddFromPanel = useCallback((template: NodeTemplate) => {
    addNode(template, 200 + nodes.length * 30, 150 + nodes.length * 20);
  }, [addNode, nodes.length]);

  const loadTemplate = useCallback((idx: number) => {
    const t = DEFAULT_TEMPLATES[idx];
    const newNodes: CanvasNode[] = t.nodes.map((n, i) => ({
      ...n, id: `n${i}`, ports: n.ports.map(p => ({ ...p })), data: { ...n.data },
    }));
    const newConns: Connection[] = t.connections.map((c, i) => ({
      id: `c${i}`, fromNode: c.fromNode, fromPort: c.fromPort, toNode: c.toNode, toPort: c.toPort,
    }));
    setNodes(newNodes);
    setConnections(newConns);
  }, []);

  const deleteNode = useCallback((id: string) => {
    setNodes(prev => prev.filter(n => n.id !== id));
    setConnections(prev => prev.filter(c => c.fromNode !== id && c.toNode !== id));
  }, []);

  const addAgentMessages = useCallback((user: AgentMessage, assistant: AgentMessage) => {
    setAgentMessages(prev => [...prev, user, assistant]);
  }, []);

  const applyWorkflow = useCallback((wfNodes: any[], wfConnections: any[]) => {
    const newNodes: CanvasNode[] = wfNodes.map((n: any, i: number) => {
      const template = NODE_TEMPLATES.find(t => t.type === n.type);
      return {
        id: `n${i}`, type: n.type, label: n.label || template?.label || n.type,
        category: template?.category || 'input',
        x: n.x ?? 100 + i * 280, y: n.y ?? 150 + (i % 3) * 180,
        ports: template?.ports.map(p => ({ ...p })) || [],
        data: { ...(template?.defaultData || {}), ...(n.data || {}) },
        width: template?.width || 200,
      };
    });
    const newConns: Connection[] = wfConnections.map((c: any, i: number) => ({
      id: `c${i}`, fromNode: typeof c.fromNode === 'number' ? `n${c.fromNode}` : c.fromNode,
      fromPort: c.fromPort, toNode: typeof c.toNode === 'number' ? `n${c.toNode}` : c.toNode,
      toPort: c.toPort,
    }));
    setNodes(newNodes);
    setConnections(newConns);
  }, []);

  return (
    <div className="canvas-tab">
      <NodesPanel onAddNode={handleAddFromPanel} onLoadTemplate={loadTemplate} />
      <NodeCanvas nodes={nodes} connections={connections} onNodesChange={setNodes} onConnectionsChange={setConnections} onAddNode={addNode} onDeleteNode={deleteNode} />
      <AIAgentPanel messages={agentMessages} onAddMessages={addAgentMessages} onApplyWorkflow={applyWorkflow} apiKeys={apiKeys} />
    </div>
  );
}
