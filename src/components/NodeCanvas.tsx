import { useState, useRef, useCallback, useEffect } from 'react';
import { ZoomIn, ZoomOut, Maximize2 } from 'lucide-react';
import { NODE_TEMPLATES, PORT_COLORS, uid, type CanvasNode, type Connection, type NodeTemplate } from '../types/canvas';

interface Props {
  nodes: CanvasNode[];
  connections: Connection[];
  onNodesChange: (nodes: CanvasNode[]) => void;
  onConnectionsChange: (conns: Connection[]) => void;
  onAddNode: (template: NodeTemplate, x: number, y: number) => void;
  onDeleteNode: (id: string) => void;
}

export function NodeCanvas({ nodes, connections, onNodesChange, onConnectionsChange, onAddNode, onDeleteNode }: Props) {
  const svgRef = useRef<SVGSVGElement>(null);
  const canvasRef = useRef<HTMLDivElement>(null);
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [dragging, setDragging] = useState<string | null>(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [panning, setPanning] = useState(false);
  const [panStart, setPanStart] = useState({ x: 0, y: 0 });
  const [connecting, setConnecting] = useState<{ nodeId: string; portId: string; portType: string; x: number; y: number } | null>(null);
  const [selectedNode, setSelectedNode] = useState<string | null>(null);

  const PORT_SIZE = 12;
  const HEADER_H = 28;
  const PORT_SPACING = 26;
  const PORT_PAD = 10;

  const getPortPos = useCallback((node: CanvasNode, portId: string) => {
    const inPorts = node.ports.filter(p => p.dir === 'in');
    const outPorts = node.ports.filter(p => p.dir === 'out');

    const allPorts = [...inPorts.map((p, i) => ({ ...p, idx: i, side: 'left' as const })),
                      ...outPorts.map((p, i) => ({ ...p, idx: i, side: 'right' as const }))];
    const port = allPorts.find(p => p.id === portId);
    if (!port) return { x: node.x, y: node.y };

    const px = port.side === 'left' ? node.x : node.x + node.width;
    const py = node.y + HEADER_H + port.idx * PORT_SPACING + PORT_SPACING / 2;
    return { x: px, y: py };
  }, []);

  // Handle drop from NodesPanel
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const nodeType = e.dataTransfer.getData('nodeType');
    if (!nodeType) return;
    const template = NODE_TEMPLATES.find(t => t.type === nodeType);
    if (!template) return;
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;
    const x = (e.clientX - rect.left - pan.x) / zoom;
    const y = (e.clientY - rect.top - pan.y) / zoom;
    onAddNode(template, x, y);
  };

  const handleDragOver = (e: React.DragEvent) => { e.preventDefault(); };

  // Node dragging
  const handleNodeMouseDown = (e: React.MouseEvent, nodeId: string) => {
    e.stopPropagation();
    const node = nodes.find(n => n.id === nodeId);
    if (!node) return;
    setSelectedNode(nodeId);
    setDragging(nodeId);
    setDragOffset({ x: e.clientX / zoom - node.x, y: e.clientY / zoom - node.y });
  };

  // Port connection start
  const handlePortMouseDown = (e: React.MouseEvent, nodeId: string, portId: string, portType: string) => {
    e.stopPropagation();
    const node = nodes.find(n => n.id === nodeId);
    if (!node) return;
    const pos = getPortPos(node, portId);
    setConnecting({ nodeId, portId, portType, x: pos.x, y: pos.y });
  };

  // Canvas mouse move
  const handleMouseMove = (e: React.MouseEvent) => {
    if (dragging) {
      const node = nodes.find(n => n.id === dragging);
      if (!node) return;
      const nx = e.clientX / zoom - dragOffset.x;
      const ny = e.clientY / zoom - dragOffset.y;
      onNodesChange(nodes.map(n => n.id === dragging ? { ...n, x: nx, y: ny } : n));
    }
    if (panning) {
      const dx = e.clientX - panStart.x;
      const dy = e.clientY - panStart.y;
      setPanStart({ x: e.clientX, y: e.clientY });
      setPan(p => ({ x: p.x + dx, y: p.y + dy }));
    }
    if (connecting) {
      const rect = canvasRef.current?.getBoundingClientRect();
      if (!rect) return;
      setConnecting(c => c ? { ...c, x: (e.clientX - rect.left - pan.x) / zoom, y: (e.clientY - rect.top - pan.y) / zoom } : null);
    }
  };

  // Port connection end
  const handlePortMouseUp = (_e: React.MouseEvent, nodeId: string, portId: string, dir: string) => {
    if (!connecting) return;
    if (dir !== 'in' || connecting.nodeId === nodeId) { setConnecting(null); return; }

    // Prevent duplicate connections
    const exists = connections.some(c => c.fromNode === connecting.nodeId && c.fromPort === connecting.portId && c.toNode === nodeId && c.toPort === portId);
    if (!exists) {
      onConnectionsChange([...connections, { id: uid(), fromNode: connecting.nodeId, fromPort: connecting.portId, toNode: nodeId, toPort: portId }]);
    }
    setConnecting(null);
  };

  const handleMouseUp = () => { setDragging(null); setPanning(false); if (connecting) setConnecting(null); };
  const handleCanvasMouseDown = (e: React.MouseEvent) => { if (e.button === 1 || (e.button === 0 && e.altKey)) { setPanning(true); setPanStart({ x: e.clientX, y: e.clientY }); } else { setSelectedNode(null); } };

  const zoomIn = () => setZoom(z => Math.min(z + 0.15, 2));
  const zoomOut = () => setZoom(z => Math.max(z - 0.15, 0.3));
  const zoomFit = () => { setZoom(1); setPan({ x: 0, y: 0 }); };

  // Keyboard delete
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Delete' && selectedNode) onDeleteNode(selectedNode);
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [selectedNode, onDeleteNode]);

  const deleteConn = (id: string) => onConnectionsChange(connections.filter(c => c.id !== id));

  return (
    <div className="node-canvas-wrap" onDrop={handleDrop} onDragOver={handleDragOver}>
      <div className="nc-toolbar">
        <button className="nc-tool-btn" onClick={zoomOut} title="Zoom Out"><ZoomOut size={14} /></button>
        <span className="nc-zoom-label">{Math.round(zoom * 100)}%</span>
        <button className="nc-tool-btn" onClick={zoomIn} title="Zoom In"><ZoomIn size={14} /></button>
        <button className="nc-tool-btn" onClick={zoomFit} title="Fit View"><Maximize2 size={14} /></button>
      </div>

      <div className="node-canvas" ref={canvasRef} onMouseDown={handleCanvasMouseDown} onMouseMove={handleMouseMove} onMouseUp={handleMouseUp} onMouseLeave={handleMouseUp}>
        <svg ref={svgRef} className="nc-svg" style={{ transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`, transformOrigin: '0 0' }}>
          {/* Grid background */}
          <defs>
            <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 40" fill="none" stroke="var(--border)" strokeWidth="0.5" />
            </pattern>
          </defs>
          <rect width="10000" height="10000" x="-5000" y="-5000" fill="url(#grid)" />

          {/* Connections */}
          {connections.map(conn => {
            const fromNode = nodes.find(n => n.id === conn.fromNode);
            const toNode = nodes.find(n => n.id === conn.toNode);
            if (!fromNode || !toNode) return null;
            const from = getPortPos(fromNode, conn.fromPort);
            const to = getPortPos(toNode, conn.toPort);
            const port = fromNode.ports.find(p => p.id === conn.fromPort);
            const color = port ? PORT_COLORS[port.type] : '#555';
            const dx = Math.abs(to.x - from.x) * 0.5;
            return (
              <g key={conn.id} className="nc-conn" onClick={() => deleteConn(conn.id)}>
                <path d={`M${from.x},${from.y} C${from.x + dx},${from.y} ${to.x - dx},${to.y} ${to.x},${to.y}`}
                  fill="none" stroke={color} strokeWidth={2.5} opacity={0.7} />
                <path d={`M${from.x},${from.y} C${from.x + dx},${from.y} ${to.x - dx},${to.y} ${to.x},${to.y}`}
                  fill="none" stroke="transparent" strokeWidth={12} style={{ cursor: 'pointer' }} />
              </g>
            );
          })}

          {/* Active connection drawing */}
          {connecting && (
            <path d={`M${connecting.x},${connecting.y} C${connecting.x + 50},${connecting.y} ${connecting.x + 50},${connecting.y} ${connecting.x},${connecting.y}`}
              fill="none" stroke={PORT_COLORS[connecting.portType as keyof typeof PORT_COLORS] ?? '#fff'} strokeWidth={2} strokeDasharray="6 3" opacity={0.8} />
          )}

          {/* Nodes */}
          {nodes.map(node => {
            const inPorts = node.ports.filter(p => p.dir === 'in');
            const outPorts = node.ports.filter(p => p.dir === 'out');
            const maxPorts = Math.max(inPorts.length, outPorts.length, 1);
            const nodeH = HEADER_H + maxPorts * PORT_SPACING + PORT_PAD;
            const isSelected = selectedNode === node.id;

            return (
              <g key={node.id} className={`nc-node ${isSelected ? 'selected' : ''}`}
                onMouseDown={e => handleNodeMouseDown(e, node.id)} style={{ cursor: 'grab' }}>

                {/* Shadow */}
                <rect x={node.x + 3} y={node.y + 3} width={node.width} height={nodeH} rx={8} fill="rgba(0,0,0,0.3)" />

                {/* Body */}
                <rect x={node.x} y={node.y} width={node.width} height={nodeH} rx={8}
                  fill="var(--surface)" stroke={isSelected ? 'var(--neon)' : 'var(--border-strong)'} strokeWidth={isSelected ? 2 : 1.5} />

                {/* Header */}
                <rect x={node.x} y={node.y} width={node.width} height={HEADER_H} rx={8}
                  fill="var(--border-strong)" />
                <rect x={node.x} y={node.y + HEADER_H - 8} width={node.width} height={8}
                  fill="var(--border-strong)" />
                <text x={node.x + 10} y={node.y + 18} fill="var(--text)" fontSize={11} fontWeight={700} fontFamily="Inter, sans-serif">{node.label}</text>

                {/* Input ports */}
                {inPorts.map((port, i) => {
                  const py = node.y + HEADER_H + i * PORT_SPACING + PORT_SPACING / 2;
                  const color = PORT_COLORS[port.type];
                  return (
                    <g key={port.id} onMouseDown={e => handlePortMouseDown(e, node.id, port.id, port.type)} onMouseUp={e => handlePortMouseUp(e, node.id, port.id, 'in')}>
                      <circle cx={node.x} cy={py} r={PORT_SIZE / 2} fill={color} stroke="var(--bg)" strokeWidth={1.5} style={{ cursor: 'crosshair' }} />
                      <text x={node.x + PORT_SIZE + 2} y={py + 3} fill="var(--text-sec)" fontSize={9} fontFamily="Inter, sans-serif">{port.label}</text>
                    </g>
                  );
                })}

                {/* Output ports */}
                {outPorts.map((port, i) => {
                  const py = node.y + HEADER_H + i * PORT_SPACING + PORT_SPACING / 2;
                  const color = PORT_COLORS[port.type];
                  return (
                    <g key={port.id} onMouseDown={e => handlePortMouseDown(e, node.id, port.id, port.type)} onMouseUp={e => handlePortMouseUp(e, node.id, port.id, 'out')}>
                      <circle cx={node.x + node.width} cy={py} r={PORT_SIZE / 2} fill={color} stroke="var(--bg)" strokeWidth={1.5} style={{ cursor: 'crosshair' }} />
                      <text x={node.x + node.width - PORT_SIZE - 2} y={py + 3} fill="var(--text-sec)" fontSize={9} fontFamily="Inter, sans-serif" textAnchor="end">{port.label}</text>
                    </g>
                  );
                })}

                {/* Delete button on selected */}
                {isSelected && (
                  <g className="nc-delete" onClick={e => { e.stopPropagation(); onDeleteNode(node.id); }} style={{ cursor: 'pointer' }}>
                    <circle cx={node.x + node.width - 12} cy={node.y + 12} r={8} fill="var(--error)" opacity={0.9} />
                    <text x={node.x + node.width - 12} y={node.y + 16} fill="#fff" fontSize={10} textAnchor="middle" fontWeight={800}>x</text>
                  </g>
                )}
              </g>
            );
          })}
        </svg>
      </div>
    </div>
  );
}
