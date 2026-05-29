import React from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  CheckCircle2, 
  MapPin, 
  Phone, 
  Users, 
  Package,
  ArrowRight,
  LayoutDashboard
} from 'lucide-react';

interface SetupStatus {
  customers: boolean;
  products: boolean;
  address: boolean;
  phone: boolean;
  loading: boolean;
}

interface PendingSetupTasksProps {
  setupStatus: SetupStatus;
  setIsEditing: (val: boolean) => void;
}

const PendingSetupTasks: React.FC<PendingSetupTasksProps> = ({ setupStatus, setIsEditing }) => {
  const navigate = useNavigate();

  const tasks = [
    { 
      label: 'Add Business Address', 
      done: setupStatus.address, 
      path: '/settings/profile',
      icon: MapPin,
      colorClasses: 'bg-blue-50 text-blue-600 group-hover:bg-blue-100'
    },
    { 
      label: 'Add Phone Number', 
      done: setupStatus.phone, 
      path: '/settings/profile',
      icon: Phone,
      colorClasses: 'bg-purple-50 text-purple-600 group-hover:bg-purple-100'
    },
    { 
      label: 'Add Your First Customer', 
      done: setupStatus.customers, 
      path: '/customers/new',
      icon: Users,
      colorClasses: 'bg-indigo-50 text-indigo-600 group-hover:bg-indigo-100'
    },
    { 
      label: 'Add Your First Product/Service', 
      done: setupStatus.products, 
      path: '/products/new',
      icon: Package,
      colorClasses: 'bg-violet-50 text-violet-600 group-hover:bg-violet-100'
    },
  ];

  const handleTaskClick = (task: typeof tasks[0]) => {
    if (!task.done) {
      if (task.path === '/profile') {
        setIsEditing(true);
        window.scrollTo({ top: 500, behavior: 'smooth' });
      } else {
        navigate(task.path);
      }
    }
  };

  if (setupStatus.loading) return null;
  
  const isAllDone = tasks.every(t => t.done);
  if (isAllDone) return null;

  return (
    <div className="mb-8 p-4 sm:p-6 rounded-2xl bg-white/70 backdrop-blur-[10px] border border-white/20 shadow-[0_8px_32px_0_rgba(31,38,135,0.07),0_1px_2px_0_rgba(0,0,0,0.05)] transition-all duration-300 max-w-full overflow-hidden">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2.5 rounded-xl bg-blue-600/10 text-blue-600 shrink-0">
          <LayoutDashboard size={24} />
        </div>
        <div className="min-w-0">
          <h2 className="text-lg sm:text-xl font-bold text-slate-800 tracking-tight truncate">Pending Setup Tasks</h2>
          <p className="text-xs sm:text-sm text-slate-500 font-medium truncate sm:whitespace-normal">Complete these to unlock the full potential of your dashboard</p>
        </div>
      </div>

      <div className="flex flex-wrap gap-4 sm:gap-6 justify-center items-stretch">
        {tasks.map((task, idx) => {
          const Icon = task.icon;
          return (
            <div 
              key={idx}
              onClick={() => handleTaskClick(task)}
              className={`
                group relative flex flex-col min-[450px]:flex-row items-center gap-4 p-5 rounded-xl border transition-all duration-300
                flex-grow shrink-0 basis-full md:basis-[calc(50%-1.5rem)] xl:basis-[calc(33.333%-1.5rem)]
                min-h-[110px]
                ${task.done 
                  ? 'bg-emerald-50/40 border-emerald-100/50' 
                  : 'bg-white border-slate-100 cursor-pointer @media(hover:hover){hover:border-blue-200 hover:shadow-lg hover:scale-[1.02]}'
                }
              `}
            >
              {/* Left Accent for Pending */}
              {!task.done && (
                <div className="hidden min-[450px]:block absolute left-0 top-1/4 bottom-1/4 w-1 bg-gradient-to-b from-blue-500 to-indigo-600 rounded-r-full opacity-0 @media(hover:hover){group-hover:opacity-100} transition-all duration-300" />
              )}

              {/* Icon Container */}
              <div className={`
                w-12 h-12 rounded-xl flex items-center justify-center transition-all duration-300 shrink-0
                ${task.done 
                  ? 'bg-emerald-100 text-emerald-600' 
                  : `${task.colorClasses} @media(hover:hover){group-hover:scale-110}`
                }
              `}>
                <Icon size={22} strokeWidth={2} />
              </div>

              {/* Content */}
              <div className="flex-grow text-center min-[450px]:text-left min-w-0">
                <p className={`font-semibold text-sm sm:text-base transition-colors duration-300 truncate ${task.done ? 'text-emerald-800/40 line-through' : 'text-slate-700 @media(hover:hover){group-hover:text-blue-700}'}`} title={task.label}>
                  {task.label}
                </p>
                {task.done && (
                  <div className="flex items-center justify-center min-[450px]:justify-start gap-1.5 mt-1">
                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                    <span className="text-[10px] sm:text-[11px] uppercase tracking-wider font-bold text-emerald-600/70">
                      Task Completed
                    </span>
                  </div>
                )}
              </div>

              {/* Action */}
              <div className="flex items-center shrink-0 mt-2 min-[450px]:mt-0">
                {task.done ? (
                  <div className="w-10 h-10 sm:w-8 sm:h-8 rounded-full bg-emerald-500 flex items-center justify-center text-white shadow-sm shadow-emerald-200">
                    <CheckCircle2 size={18} />
                  </div>
                ) : (
                  <button 
                    className="
                      flex items-center justify-center gap-2 px-6 py-2.5 sm:px-5 sm:py-2 min-h-[44px] min-w-[80px] rounded-full text-sm font-bold
                      bg-gradient-to-r from-blue-600 to-indigo-600 text-white
                      shadow-[0_4px_12px_rgba(37,99,235,0.2)] 
                      @media(hover:hover){hover:shadow-[0_6px_20px_rgba(37,99,235,0.3)]}
                      transition-all duration-300 transform active:scale-95
                      animate-pulse-subtle
                    "
                  >
                    Go <ArrowRight size={16} />
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes pulse-subtle {
          0%, 100% { transform: scale(1); box-shadow: 0 4px 12px rgba(37,99,235,0.2); }
          50% { transform: scale(1.03); box-shadow: 0 6px 20px rgba(37,99,235,0.35); }
        }
        .animate-pulse-subtle {
          animation: pulse-subtle 2.5s infinite ease-in-out;
        }
        @media (hover: none) {
          .animate-pulse-subtle {
            animation: none;
          }
        }
      `}} />
    </div>
  );
};

export default PendingSetupTasks;
