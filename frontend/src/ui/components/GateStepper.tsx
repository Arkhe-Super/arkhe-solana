import { CheckCircle2, Circle, Clock } from 'lucide-react';

interface Gate {
  id: string;
  name: string;
  status: 'pending' | 'active' | 'completed' | 'error';
  description?: string;
}

interface GateStepperProps {
  gates: Gate[];
}

export function GateStepper({ gates }: GateStepperProps) {
  return (
    <div className="w-full py-4">
      <div className="flex justify-between items-center relative">
        {/* Progress Bar Background */}
        <div className="absolute top-1/2 left-0 w-full h-1 bg-gray-200 -translate-y-1/2 rounded-full" />

        {/* Active Progress Bar */}
        <div
          className="absolute top-1/2 left-0 h-1 bg-blue-600 -translate-y-1/2 rounded-full transition-all duration-300"
          style={{
            width: `${Math.max(0, (gates.filter(g => g.status === 'completed').length / (gates.length - 1)) * 100)}%`
          }}
        />

        {/* Steps */}
        {gates.map((gate) => (
          <div key={gate.id} className="relative z-10 flex flex-col items-center">
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center bg-white border-2 transition-colors duration-300 ${
                gate.status === 'completed' ? 'border-green-500 text-green-500' :
                gate.status === 'active' ? 'border-blue-600 text-blue-600' :
                gate.status === 'error' ? 'border-red-500 text-red-500' :
                'border-gray-300 text-gray-300'
              }`}
            >
              {gate.status === 'completed' && <CheckCircle2 className="w-5 h-5" />}
              {gate.status === 'active' && <Clock className="w-5 h-5 animate-pulse" />}
              {gate.status === 'error' && <Circle className="w-5 h-5 text-red-500" />}
              {gate.status === 'pending' && <Circle className="w-5 h-5" />}
            </div>

            <div className="mt-2 text-center absolute top-10 w-32 -ml-12">
              <p className={`text-sm font-medium ${
                gate.status === 'completed' ? 'text-green-600' :
                gate.status === 'active' ? 'text-blue-700' :
                gate.status === 'error' ? 'text-red-600' :
                'text-gray-500'
              }`}>
                {gate.name}
              </p>
              {gate.description && (
                <p className="text-xs text-gray-400 mt-1">{gate.description}</p>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
