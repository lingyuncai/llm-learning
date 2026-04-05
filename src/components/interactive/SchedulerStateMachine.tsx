import { useState } from 'react';
import { COLORS, FONTS } from './shared/colors';

const W = 580;
const H = 400;

type State = 'waiting' | 'running' | 'swapped' | 'finished';

interface StateNode {
  id: State;
  label: string;
  x: number;
  y: number;
  color: string;
}

const STATES: StateNode[] = [
  { id: 'waiting',  label: 'Waiting',  x: 110, y: 110, color: COLORS.orange },
  { id: 'running',  label: 'Running',  x: 350, y: 110, color: COLORS.green },
  { id: 'swapped',  label: 'Swapped',  x: 230, y: 260, color: COLORS.purple },
  { id: 'finished', label: 'Finished', x: 470, y: 260, color: COLORS.mid },
];

interface Transition {
  from: State;
  to: State;
  label: string;
  event: string;
}

const TRANSITIONS: Transition[] = [
  { from: 'waiting', to: 'running',  label: 'GPU slot 空闲', event: 'schedule' },
  { from: 'running', to: 'finished', label: '生成 EOS', event: 'finish' },
  { from: 'running', to: 'swapped',  label: '显存不足', event: 'preempt' },
  { from: 'swapped', to: 'running',  label: 'swap 完成', event: 'resume' },
];

const NODE_RX = 45;
const NODE_RY = 25;

export default function SchedulerStateMachine() {
  const [currentState, setCurrentState] = useState<State>('waiting');
  const [lastEvent, setLastEvent] = useState<string | null>(null);

  const getNode = (id: State) => STATES.find(s => s.id === id)!;
  const availableTransitions = TRANSITIONS.filter(t => t.from === currentState);

  const triggerEvent = (t: Transition) => {
    setCurrentState(t.to);
    setLastEvent(t.event);
  };

  const reset = () => { setCurrentState('waiting'); setLastEvent(null); };

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full">
      <defs>
        <marker id="sm-arrow" markerWidth="8" markerHeight="8" refX="7" refY="4" orient="auto">
          <polygon points="0 0, 8 4, 0 8" fill={COLORS.mid} />
        </marker>
      </defs>

      <text x={W / 2} y={22} textAnchor="middle" fontSize="14" fontWeight="700"
        fill={COLORS.dark} fontFamily={FONTS.sans}>
        Scheduler 请求状态机
      </text>
      <text x={W / 2} y={40} textAnchor="middle" fontSize="10"
        fill={COLORS.mid} fontFamily={FONTS.sans}>
        点击下方按钮触发状态转换
      </text>

      {/* Transition edges */}
      {TRANSITIONS.map((t, i) => {
        const from = getNode(t.from);
        const to = getNode(t.to);
        const isActive = currentState === t.from;
        const mx = (from.x + to.x) / 2;
        const my = (from.y + to.y) / 2 - 15;
        return (
          <g key={i}>
            <line x1={from.x} y1={from.y} x2={to.x} y2={to.y}
              stroke={isActive ? COLORS.primary : COLORS.light}
              strokeWidth={isActive ? 2 : 1}
              markerEnd="url(#sm-arrow)" />
            <text x={mx} y={my} textAnchor="middle" fontSize="8"
              fill={isActive ? COLORS.primary : COLORS.mid} fontFamily={FONTS.sans}>
              {t.label}
            </text>
          </g>
        );
      })}

      {/* State nodes */}
      {STATES.map((s) => {
        const isCurrent = currentState === s.id;
        return (
          <g key={s.id}>
            <ellipse cx={s.x} cy={s.y} rx={NODE_RX} ry={NODE_RY}
              fill={s.color} opacity={isCurrent ? 0.25 : 0.08}
              stroke={s.color} strokeWidth={isCurrent ? 3 : 1.5} />
            <text x={s.x} y={s.y + 5} textAnchor="middle" fontSize="12"
              fontWeight={isCurrent ? '700' : '500'}
              fill={isCurrent ? s.color : COLORS.dark} fontFamily={FONTS.sans}>
              {s.label}
            </text>
          </g>
        );
      })}

      {/* Action buttons */}
      {availableTransitions.map((t, i) => {
        const btnY = 330 + i * 34;
        return (
          <g key={`btn-${i}`} onClick={() => triggerEvent(t)} cursor="pointer">
            <rect x={120} y={btnY} width={240} height={28} rx={14}
              fill={COLORS.bgAlt} stroke={COLORS.primary} strokeWidth="1.5" />
            <text x={240} y={btnY + 18} textAnchor="middle" fontSize="10"
              fontWeight="600" fill={COLORS.primary} fontFamily={FONTS.sans}>
              {t.label} → {getNode(t.to).label}
            </text>
          </g>
        );
      })}

      {currentState === 'finished' && (
        <g onClick={reset} cursor="pointer">
          <rect x={200} y={330} width={100} height={28} rx={14}
            fill={COLORS.bgAlt} stroke={COLORS.mid} strokeWidth="1" />
          <text x={250} y={348} textAnchor="middle" fontSize="10"
            fontWeight="600" fill={COLORS.mid} fontFamily={FONTS.sans}>重置</text>
        </g>
      )}

      {lastEvent && (
        <text x={430} y={350} textAnchor="middle" fontSize="9"
          fill={COLORS.mid} fontFamily={FONTS.mono}>
          最近事件: {lastEvent}
        </text>
      )}
    </svg>
  );
}
