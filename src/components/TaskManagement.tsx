import { useState } from 'react';
import { 
  Calendar, 
  Clock, 
  CheckCircle, 
  Circle, 
  AlertTriangle, 
  Flag, 
  MoreHorizontal,
  Plus,
  Edit,
  Trash2,
  User,
  Search,
  Filter
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface Task {
  id: string;
  title: string;
  description: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'todo' | 'in-progress' | 'completed' | 'on-hold';
  assignee: string;
  dueDate: string;
  createdAt: string;
  tags: string[];
}

export default function TaskManagement() {
  const [tasks, setTasks] = useState<Task[]>([
    {
      id: 'task-001',
      title: 'Update inventory database',
      description: 'Sync all inventory items with the latest pricing and stock levels',
      priority: 'high',
      status: 'in-progress',
      assignee: 'John Doe',
      dueDate: '2024-01-15',
      createdAt: '2024-01-10',
      tags: ['inventory', 'database']
    },
    {
      id: 'task-002',
      title: 'Process customer orders',
      description: 'Review and process pending customer orders from last week',
      priority: 'medium',
      status: 'todo',
      assignee: 'Jane Smith',
      dueDate: '2024-01-12',
      createdAt: '2024-01-09',
      tags: ['orders', 'customer']
    },
    {
      id: 'task-003',
      title: 'Schedule maintenance',
      description: 'Plan monthly maintenance for workshop equipment',
      priority: 'low',
      status: 'completed',
      assignee: 'Mike Johnson',
      dueDate: '2024-01-08',
      createdAt: '2024-01-05',
      tags: ['maintenance', 'workshop']
    },
    {
      id: 'task-004',
      title: 'Prepare sales report',
      description: 'Compile monthly sales report for management review',
      priority: 'urgent',
      status: 'todo',
      assignee: 'Sarah Wilson',
      dueDate: '2024-01-11',
      createdAt: '2024-01-07',
      tags: ['report', 'sales']
    },
    {
      id: 'task-005',
      title: 'Customer feedback analysis',
      description: 'Analyze recent customer feedback and suggest improvements',
      priority: 'medium',
      status: 'on-hold',
      assignee: 'David Brown',
      dueDate: '2024-01-20',
      createdAt: '2024-01-06',
      tags: ['feedback', 'analysis']
    }
  ]);

  const [newTask, setNewTask] = useState({
    title: '',
    description: '',
    priority: 'medium' as 'low' | 'medium' | 'high' | 'urgent',
    assignee: '',
    dueDate: ''
  });

  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  const addTask = () => {
    if (!newTask.title.trim()) return;

    const task: Task = {
      id: `task-${Date.now()}`,
      title: newTask.title,
      description: newTask.description,
      priority: newTask.priority,
      status: 'todo',
      assignee: newTask.assignee || 'Unassigned',
      dueDate: newTask.dueDate || new Date().toISOString().split('T')[0],
      createdAt: new Date().toISOString().split('T')[0],
      tags: []
    };

    setTasks([task, ...tasks]);
    setNewTask({
      title: '',
      description: '',
      priority: 'medium',
      assignee: '',
      dueDate: ''
    });
  };

  const updateTaskStatus = (taskId: string, status: Task['status']) => {
    setTasks(tasks.map(task => 
      task.id === taskId ? { ...task, status } : task
    ));
  };

  const deleteTask = (taskId: string) => {
    setTasks(tasks.filter(task => task.id !== taskId));
  };

  const getPriorityColor = (priority: string) => {
    switch(priority) {
      case 'low': return 'bg-green-100 text-green-800';
      case 'medium': return 'bg-blue-100 text-blue-800';
      case 'high': return 'bg-yellow-100 text-yellow-800';
      case 'urgent': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusColor = (status: string) => {
    switch(status) {
      case 'todo': return 'bg-gray-100 text-gray-800';
      case 'in-progress': return 'bg-blue-100 text-blue-800';
      case 'completed': return 'bg-green-100 text-green-800';
      case 'on-hold': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const filteredTasks = tasks.filter(task => {
    const matchesFilter = filter === 'all' || task.status === filter;
    const matchesSearch = task.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          task.description.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <CardTitle className="flex items-center gap-2">
            <Flag className="w-5 h-5" />
            Task Management
          </CardTitle>
          <div className="flex gap-2">
            <div className="relative">
              <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input 
                placeholder="Search tasks..." 
                className="pl-8" 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Select value={filter} onValueChange={setFilter}>
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="Filter" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="todo">To Do</SelectItem>
                <SelectItem value="in-progress">In Progress</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="on-hold">On Hold</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {/* Add New Task Form */}
        <div className="mb-6 p-4 border rounded-lg bg-muted/30">
          <h3 className="font-medium mb-3">Add New Task</h3>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
            <div className="md:col-span-2">
              <Input 
                placeholder="Task title" 
                value={newTask.title}
                onChange={(e) => setNewTask({...newTask, title: e.target.value})}
              />
            </div>
            <div>
              <Select value={newTask.priority} onValueChange={(value: 'low' | 'medium' | 'high' | 'urgent') => setNewTask({...newTask, priority: value})}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="urgent">Urgent</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Input 
                placeholder="Assignee" 
                value={newTask.assignee}
                onChange={(e) => setNewTask({...newTask, assignee: e.target.value})}
              />
            </div>
            <div className="flex gap-2">
              <Button onClick={addTask} className="w-full">
                <Plus className="w-4 h-4 mr-2" />
                Add
              </Button>
            </div>
          </div>
        </div>

        {/* Tasks List */}
        <div className="space-y-4">
          {filteredTasks.length > 0 ? (
            filteredTasks.map((task) => (
              <div key={task.id} className="flex items-start gap-4 p-4 border rounded-lg hover:bg-accent/30">
                <div className="flex flex-col gap-2">
                  <button 
                    onClick={() => updateTaskStatus(task.id, task.status === 'completed' ? 'todo' : 'completed')}
                    className="mt-1"
                  >
                    {task.status === 'completed' ? (
                      <CheckCircle className="w-5 h-5 text-green-500" />
                    ) : (
                      <Circle className="w-5 h-5 text-muted-foreground" />
                    )}
                  </button>
                  <div className="flex flex-col gap-1">
                    <Badge className={getPriorityColor(task.priority)}>
                      {task.priority.charAt(0).toUpperCase() + task.priority.slice(1)}
                    </Badge>
                  </div>
                </div>
                
                <div className="flex-1">
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="font-medium">{task.title}</h4>
                      <p className="text-sm text-muted-foreground mt-1">{task.description}</p>
                    </div>
                    <div className="flex gap-1">
                      <Button variant="ghost" size="sm">
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => deleteTask(task.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="sm">
                        <MoreHorizontal className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                  
                  <div className="flex flex-wrap gap-4 mt-3 text-sm">
                    <div className="flex items-center gap-1">
                      <User className="w-4 h-4 text-muted-foreground" />
                      <span>{task.assignee}</span>
                    </div>
                    
                    <div className="flex items-center gap-1">
                      <Calendar className="w-4 h-4 text-muted-foreground" />
                      <span>Due: {task.dueDate}</span>
                    </div>
                    
                    <div className="flex items-center gap-1">
                      <Clock className="w-4 h-4 text-muted-foreground" />
                      <span>Created: {task.createdAt}</span>
                    </div>
                    
                    <div>
                      <Badge className={getStatusColor(task.status)}>
                        {task.status.replace('-', ' ').charAt(0).toUpperCase() + task.status.replace('-', ' ').slice(1)}
                      </Badge>
                    </div>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <AlertTriangle className="w-12 h-12 mx-auto mb-3 text-muted" />
              <p>No tasks found</p>
              <p className="text-sm">Try changing your filters or add a new task</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}