import { useState, useEffect } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { tasksAPI, reviewsAPI } from '../services/api'
import Layout from './Layout'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Textarea } from '@/components/ui/textarea'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { CheckCircle, Clock, FileText, Star } from 'lucide-react'

export default function EmployeeDashboard() {
  const queryClient = useQueryClient()
  const [selectedTask, setSelectedTask] = useState(null)
  const [selectedReview, setSelectedReview] = useState(null)
  const [submissionNotes, setSubmissionNotes] = useState('')
  const [reviewFeedback, setReviewFeedback] = useState('')
  const [reviewScore, setReviewScore] = useState('')

  // Fetch tasks
  const { data: tasksData, isLoading: tasksLoading } = useQuery({
    queryKey: ['tasks'],
    queryFn: () => tasksAPI.getAllTasks(),
  })

  // Fetch reviews
  const { data: reviewsData, isLoading: reviewsLoading } = useQuery({
    queryKey: ['reviews'],
    queryFn: () => reviewsAPI.getAllReviews(),
  })

  // Submit task mutation
  const submitTaskMutation = useMutation({
    mutationFn: ({ taskId, submissionData }) => tasksAPI.submitTask(taskId, submissionData),
    onSuccess: () => {
      queryClient.invalidateQueries(['tasks'])
      setSelectedTask(null)
      setSubmissionNotes('')
    },
  })

  // Submit review mutation
  const submitReviewMutation = useMutation({
    mutationFn: ({ reviewId, submissionData }) => reviewsAPI.submitReview(reviewId, submissionData),
    onSuccess: () => {
      queryClient.invalidateQueries(['reviews'])
      setSelectedReview(null)
      setReviewFeedback('')
      setReviewScore('')
    },
  })

  const handleSubmitTask = (task) => {
    submitTaskMutation.mutate({
      taskId: task._id,
      submissionData: { submission_notes: submissionNotes }
    })
  }

  const handleSubmitReview = (review) => {
    submitReviewMutation.mutate({
      reviewId: review._id,
      submissionData: { 
        feedback: reviewFeedback,
        score: parseInt(reviewScore) || 0
      }
    })
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

  const pendingTasks = tasks.filter(task => task.status === 'pending')
  const completedTasks = tasks.filter(task => task.status === 'completed')
  const pendingReviews = reviews.filter(review => review.status === 'pending')
  const completedReviews = reviews.filter(review => review.status === 'completed')

  return (
    <Layout title="Employee Dashboard">
      <div className="space-y-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
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
          </TabsList>

          <TabsContent value="tasks" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>My Tasks</CardTitle>
                <CardDescription>
                  View and submit your assigned tasks
                </CardDescription>
              </CardHeader>
              <CardContent>
                {tasksLoading ? (
                  <div>Loading tasks...</div>
                ) : tasks.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    No tasks assigned yet
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
                              {task.status === 'pending' && (
                                <Dialog>
                                  <DialogTrigger asChild>
                                    <Button 
                                      size="sm"
                                      onClick={() => setSelectedTask(task)}
                                    >
                                      Submit
                                    </Button>
                                  </DialogTrigger>
                                  <DialogContent>
                                    <DialogHeader>
                                      <DialogTitle>Submit Task</DialogTitle>
                                      <DialogDescription>
                                        Submit your completed work for: {task.title}
                                      </DialogDescription>
                                    </DialogHeader>
                                    <div className="space-y-4">
                                      <div>
                                        <Label htmlFor="notes">Submission Notes</Label>
                                        <Textarea
                                          id="notes"
                                          placeholder="Add any notes about your submission..."
                                          value={submissionNotes}
                                          onChange={(e) => setSubmissionNotes(e.target.value)}
                                        />
                                      </div>
                                      <div className="flex justify-end space-x-2">
                                        <Button
                                          variant="outline"
                                          onClick={() => {
                                            setSelectedTask(null)
                                            setSubmissionNotes('')
                                          }}
                                        >
                                          Cancel
                                        </Button>
                                        <Button
                                          onClick={() => handleSubmitTask(task)}
                                          disabled={submitTaskMutation.isPending}
                                        >
                                          {submitTaskMutation.isPending ? 'Submitting...' : 'Submit Task'}
                                        </Button>
                                      </div>
                                    </div>
                                  </DialogContent>
                                </Dialog>
                              )}
                            </div>
                          </div>
                        </CardHeader>
                        <CardContent>
                          <div className="flex justify-between text-sm text-gray-500">
                            <span>Assigned by: {task.assigned_by?.username}</span>
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
                <CardTitle>Review Tasks</CardTitle>
                <CardDescription>
                  Complete your assigned review tasks
                </CardDescription>
              </CardHeader>
              <CardContent>
                {reviewsLoading ? (
                  <div>Loading reviews...</div>
                ) : reviews.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    No review tasks assigned yet
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
                              {review.status === 'pending' && (
                                <Dialog>
                                  <DialogTrigger asChild>
                                    <Button 
                                      size="sm"
                                      onClick={() => setSelectedReview(review)}
                                    >
                                      Submit Review
                                    </Button>
                                  </DialogTrigger>
                                  <DialogContent>
                                    <DialogHeader>
                                      <DialogTitle>Submit Review</DialogTitle>
                                      <DialogDescription>
                                        Submit your review for: {review.title}
                                      </DialogDescription>
                                    </DialogHeader>
                                    <div className="space-y-4">
                                      <div>
                                        <Label htmlFor="feedback">Feedback</Label>
                                        <Textarea
                                          id="feedback"
                                          placeholder="Add your feedback..."
                                          value={reviewFeedback}
                                          onChange={(e) => setReviewFeedback(e.target.value)}
                                        />
                                      </div>
                                      <div>
                                        <Label htmlFor="score">Score (0-100)</Label>
                                        <Input
                                          id="score"
                                          type="number"
                                          min="0"
                                          max="100"
                                          placeholder="Enter your score"
                                          value={reviewScore}
                                          onChange={(e) => setReviewScore(e.target.value)}
                                        />
                                      </div>
                                      <div className="flex justify-end space-x-2">
                                        <Button
                                          variant="outline"
                                          onClick={() => {
                                            setSelectedReview(null)
                                            setReviewFeedback('')
                                            setReviewScore('')
                                          }}
                                        >
                                          Cancel
                                        </Button>
                                        <Button
                                          onClick={() => handleSubmitReview(review)}
                                          disabled={submitReviewMutation.isPending}
                                        >
                                          {submitReviewMutation.isPending ? 'Submitting...' : 'Submit Review'}
                                        </Button>
                                      </div>
                                    </div>
                                  </DialogContent>
                                </Dialog>
                              )}
                            </div>
                          </div>
                        </CardHeader>
                        <CardContent>
                          <div className="flex justify-between text-sm text-gray-500">
                            <span>Assigned by: {review.manager_id?.username}</span>
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
        </Tabs>
      </div>
    </Layout>
  )
}

