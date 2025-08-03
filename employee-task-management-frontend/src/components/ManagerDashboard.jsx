import { useState, useEffect } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { tasksAPI, reviewsAPI, usersAPI } from '../services/api'
import Layout from './Layout'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Textarea } from '@/components/ui/textarea'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { CheckCircle, Clock, FileText, Star, Plus, Users, BarChart3 } from 'lucide-react'

export default function ManagerDashboard() {
  const queryClient = useQueryClient()
  const [showCreateTask, setShowCreateTask] = useState(false)
  const [showCreateReview, setShowCreateReview] = useState(false)
  const [selectedEmployee, setSelectedEmployee] = useState('')

  // Form states
  const [taskForm, setTaskForm] = useState({
    title: '',
    description: '',
    assigned_to: '',
    deadline: ''
  })

  const [reviewForm, setReviewForm] = useState({
    task_id: '',
    employee_id: '',
    module_id: '1',
    title: '',
    description: ''
  })

  // Fetch data
  const { data: tasksData, isLoading: tasksLoading } = useQuery({
    queryKey: ['tasks'],
    queryFn: () => tasksAPI.getAllTasks(),
  })

  const { data: reviewsData, isLoading: reviewsLoading } = useQuery({
    queryKey: ['reviews'],
    queryFn: () => reviewsAPI.getAllReviews(),
  })

  const { data: employeesData, isLoading: employeesLoading } = useQuery({
    queryKey: ['employees'],
    queryFn: () => usersAPI.getEmployees(),
  })

  const { data: suggestionsData } = useQuery({
    queryKey: ['suggestions', selectedEmployee],
    queryFn: () => reviewsAPI.getSuggestions(selectedEmployee),
    enabled: !!selectedEmployee,
  })

  // Mutations
  const createTaskMutation = useMutation({
    mutationFn: (taskData) => tasksAPI.createTask(taskData),
    onSuccess: () => {
      queryClient.invalidateQueries(['tasks'])
      setShowCreateTask(false)
      setTaskForm({ title: '', description: '', assigned_to: '', deadline: '' })
    },
  })

  const createReviewMutation = useMutation({
    mutationFn: (reviewData) => reviewsAPI.createReview(reviewData),
    onSuccess: () => {
      queryClient.invalidateQueries(['reviews'])
      setShowCreateReview(false)
      setReviewForm({ task_id: '', employee_id: '', module_id: '1', title: '', description: '' })
    },
  })

  const deleteTaskMutation = useMutation({
    mutationFn: (taskId) => tasksAPI.deleteTask(taskId),
    onSuccess: () => {
      queryClient.invalidateQueries(['tasks'])
    },
  })

  const handleCreateTask = () => {
    createTaskMutation.mutate(taskForm)
  }

  const handleCreateReview = () => {
    createReviewMutation.mutate(reviewForm)
  }

  const handleDeleteTask = (taskId) => {
    if (window.confirm('Are you sure you want to delete this task?')) {
      deleteTaskMutation.mutate(taskId)
    }
  }

  const getStatusBadge = (status) => {
    const variants = {
      pending: 'secondary',
      completed: 'default',
      in_review: 'outline'
    }
    return <Badge variant={variants[status]}>{status.replace('_', ' ')}</Badge>
  }

  const tasks = tasksData?.data?.data || []
  const reviews = reviewsData?.data?.data || []
  const employees = employeesData?.data?.data || []

  const pendingTasks = tasks.filter(task => task.status === 'pending')
  const completedTasks = tasks.filter(task => task.status === 'completed')
  const pendingReviews = reviews.filter(review => review.status === 'pending')
  const completedReviews = reviews.filter(review => review.status === 'completed')

  return (
    <Layout title="Manager Dashboard">
      <div className="space-y-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Employees</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{employees.length}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending Tasks</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{pendingTasks.length}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Completed Tasks</CardTitle>
              <CheckCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{completedTasks.length}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending Reviews</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{pendingReviews.length}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Completed Reviews</CardTitle>
              <Star className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{completedReviews.length}</div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Tabs defaultValue="tasks" className="space-y-4">
          <TabsList>
            <TabsTrigger value="tasks">Tasks</TabsTrigger>
            <TabsTrigger value="reviews">Reviews</TabsTrigger>
            <TabsTrigger value="employees">Employees</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
          </TabsList>

          <TabsContent value="tasks" className="space-y-4">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle>Task Management</CardTitle>
                    <CardDescription>
                      Create and manage tasks for your team
                    </CardDescription>
                  </div>
                  <Dialog open={showCreateTask} onOpenChange={setShowCreateTask}>
                    <DialogTrigger asChild>
                      <Button>
                        <Plus className="h-4 w-4 mr-2" />
                        Create Task
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Create New Task</DialogTitle>
                        <DialogDescription>
                          Assign a new task to an employee
                        </DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div>
                          <Label htmlFor="title">Title</Label>
                          <Input
                            id="title"
                            value={taskForm.title}
                            onChange={(e) => setTaskForm({ ...taskForm, title: e.target.value })}
                            placeholder="Enter task title"
                          />
                        </div>
                        <div>
                          <Label htmlFor="description">Description</Label>
                          <Textarea
                            id="description"
                            value={taskForm.description}
                            onChange={(e) => setTaskForm({ ...taskForm, description: e.target.value })}
                            placeholder="Enter task description"
                          />
                        </div>
                        <div>
                          <Label htmlFor="assigned_to">Assign To</Label>
                          <Select value={taskForm.assigned_to} onValueChange={(value) => setTaskForm({ ...taskForm, assigned_to: value })}>
                            <SelectTrigger>
                              <SelectValue placeholder="Select employee" />
                            </SelectTrigger>
                            <SelectContent>
                              {employees.map((employee) => (
                                <SelectItem key={employee._id} value={employee._id}>
                                  {employee.username}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <Label htmlFor="deadline">Deadline (Optional)</Label>
                          <Input
                            id="deadline"
                            type="date"
                            value={taskForm.deadline}
                            onChange={(e) => setTaskForm({ ...taskForm, deadline: e.target.value })}
                          />
                        </div>
                        <div className="flex justify-end space-x-2">
                          <Button variant="outline" onClick={() => setShowCreateTask(false)}>
                            Cancel
                          </Button>
                          <Button onClick={handleCreateTask} disabled={createTaskMutation.isPending}>
                            {createTaskMutation.isPending ? 'Creating...' : 'Create Task'}
                          </Button>
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>
              </CardHeader>
              <CardContent>
                {tasksLoading ? (
                  <div>Loading tasks...</div>
                ) : tasks.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    No tasks created yet
                  </div>
                ) : (
                  <div className="space-y-4">
                    {tasks.map((task) => (
                      <Card key={task._id} className="border-l-4 border-l-blue-500">
                        <CardHeader>
                          <div className="flex justify-between items-start">
                            <div>
                              <CardTitle className="text-lg">{task.title}</CardTitle>
                              <CardDescription className="mt-2">
                                {task.description}
                              </CardDescription>
                            </div>
                            <div className="flex items-center space-x-2">
                              {getStatusBadge(task.status)}
                              <Button
                                variant="destructive"
                                size="sm"
                                onClick={() => handleDeleteTask(task._id)}
                                disabled={deleteTaskMutation.isPending}
                              >
                                Delete
                              </Button>
                            </div>
                          </div>
                        </CardHeader>
                        <CardContent>
                          <div className="flex justify-between text-sm text-gray-500">
                            <span>Assigned to: {task.assigned_to?.username}</span>
                            {task.deadline && (
                              <span>Deadline: {new Date(task.deadline).toLocaleDateString()}</span>
                            )}
                          </div>
                          {task.submission_notes && (
                            <div className="mt-2 p-2 bg-gray-50 rounded">
                              <strong>Submission Notes:</strong> {task.submission_notes}
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="reviews" className="space-y-4">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle>Review Management</CardTitle>
                    <CardDescription>
                      Create and manage review tasks based on employee performance
                    </CardDescription>
                  </div>
                  <Dialog open={showCreateReview} onOpenChange={setShowCreateReview}>
                    <DialogTrigger asChild>
                      <Button>
                        <Plus className="h-4 w-4 mr-2" />
                        Create Review
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Create Review Task</DialogTitle>
                        <DialogDescription>
                          Assign a review task to an employee
                        </DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div>
                          <Label htmlFor="employee_id">Employee</Label>
                          <Select 
                            value={reviewForm.employee_id} 
                            onValueChange={(value) => {
                              setReviewForm({ ...reviewForm, employee_id: value })
                              setSelectedEmployee(value)
                            }}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select employee" />
                            </SelectTrigger>
                            <SelectContent>
                              {employees.map((employee) => (
                                <SelectItem key={employee._id} value={employee._id}>
                                  {employee.username}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <Label htmlFor="task_id">Related Task</Label>
                          <Select value={reviewForm.task_id} onValueChange={(value) => setReviewForm({ ...reviewForm, task_id: value })}>
                            <SelectTrigger>
                              <SelectValue placeholder="Select task" />
                            </SelectTrigger>
                            <SelectContent>
                              {completedTasks.map((task) => (
                                <SelectItem key={task._id} value={task._id}>
                                  {task.title}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <Label htmlFor="module_id">Module (1-10)</Label>
                          <Select value={reviewForm.module_id} onValueChange={(value) => setReviewForm({ ...reviewForm, module_id: value })}>
                            <SelectTrigger>
                              <SelectValue placeholder="Select module" />
                            </SelectTrigger>
                            <SelectContent>
                              {[1,2,3,4,5,6,7,8,9,10].map((num) => (
                                <SelectItem key={num} value={num.toString()}>
                                  Module {num}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          {suggestionsData && (
                            <div className="mt-2 p-2 bg-blue-50 rounded text-sm">
                              <strong>Suggested Module:</strong> {suggestionsData.data.data.suggested_module}
                            </div>
                          )}
                        </div>
                        <div>
                          <Label htmlFor="review_title">Review Title</Label>
                          <Input
                            id="review_title"
                            value={reviewForm.title}
                            onChange={(e) => setReviewForm({ ...reviewForm, title: e.target.value })}
                            placeholder="Enter review title"
                          />
                        </div>
                        <div>
                          <Label htmlFor="review_description">Review Description</Label>
                          <Textarea
                            id="review_description"
                            value={reviewForm.description}
                            onChange={(e) => setReviewForm({ ...reviewForm, description: e.target.value })}
                            placeholder="Enter review description"
                          />
                        </div>
                        <div className="flex justify-end space-x-2">
                          <Button variant="outline" onClick={() => setShowCreateReview(false)}>
                            Cancel
                          </Button>
                          <Button onClick={handleCreateReview} disabled={createReviewMutation.isPending}>
                            {createReviewMutation.isPending ? 'Creating...' : 'Create Review'}
                          </Button>
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>
              </CardHeader>
              <CardContent>
                {reviewsLoading ? (
                  <div>Loading reviews...</div>
                ) : reviews.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    No review tasks created yet
                  </div>
                ) : (
                  <div className="space-y-4">
                    {reviews.map((review) => (
                      <Card key={review._id} className="border-l-4 border-l-green-500">
                        <CardHeader>
                          <div className="flex justify-between items-start">
                            <div>
                              <CardTitle className="text-lg">{review.title}</CardTitle>
                              <CardDescription className="mt-2">
                                {review.description}
                              </CardDescription>
                              <Badge variant="outline" className="mt-2">
                                Module {review.module_id}
                              </Badge>
                            </div>
                            <div className="flex items-center space-x-2">
                              {getStatusBadge(review.status)}
                            </div>
                          </div>
                        </CardHeader>
                        <CardContent>
                          <div className="flex justify-between text-sm text-gray-500">
                            <span>Assigned to: {review.employee_id?.username}</span>
                            <span>Related Task: {review.task_id?.title}</span>
                          </div>
                          {review.feedback && (
                            <div className="mt-2 p-2 bg-gray-50 rounded">
                              <strong>Feedback:</strong> {review.feedback}
                              {review.score && (
                                <div className="mt-1">
                                  <strong>Score:</strong> {review.score}/100
                                </div>
                              )}
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="employees" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Employee Management</CardTitle>
                <CardDescription>
                  View and manage your team members
                </CardDescription>
              </CardHeader>
              <CardContent>
                {employeesLoading ? (
                  <div>Loading employees...</div>
                ) : employees.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    No employees found
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {employees.map((employee) => (
                      <Card key={employee._id}>
                        <CardHeader>
                          <CardTitle className="text-lg">{employee.username}</CardTitle>
                          <CardDescription>{employee.email}</CardDescription>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-2">
                            <div className="text-sm">
                              <strong>Module Scores:</strong>
                            </div>
                            <div className="grid grid-cols-5 gap-1">
                              {employee.modules_scores?.map((module) => (
                                <div key={module.module_id} className="text-center">
                                  <div className="text-xs text-gray-500">M{module.module_id}</div>
                                  <div className="text-sm font-medium">{module.score}</div>
                                </div>
                              ))}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="analytics" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Performance Analytics</CardTitle>
                <CardDescription>
                  Overview of team performance and task completion
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8 text-gray-500">
                  Analytics dashboard coming soon...
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  )
}

