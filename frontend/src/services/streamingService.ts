import apiClient from './apiClient';

export interface StreamingResponse {
  type: 'start' | 'chunk' | 'end' | 'error';
  content?: string;
  message?: string;
  credits_used?: number;
  credits_balance?: number;
  session_id?: string;
  worksheet?: any;
}

export interface StreamingCallbacks {
  onStart?: () => void;
  onChunk?: (content: string) => void;
  onEnd?: (metadata: { credits_used: number; credits_balance: number; session_id: string }) => void;
  onError?: (message: string) => void;
}

export interface WorksheetStreamingCallbacks {
  onStart?: () => void;
  onChunk?: (content: string) => void;
  onEnd?: (metadata: { worksheet: any; credits_used: number; credits_balance: number }) => void;
  onError?: (message: string) => void;
}

export interface LessonPlanStreamingCallbacks {
  onStart?: () => void;
  onChunk?: (content: string) => void;
  onEnd?: (metadata: { lesson_plan: any; credits_used: number; credits_balance: number }) => void;
  onError?: (message: string) => void;
}

export interface QuizStreamingCallbacks {
  onStart?: () => void;
  onChunk?: (content: string) => void;
  onEnd?: (metadata: { quiz: any; credits_used: number; credits_balance: number }) => void;
  onError?: (message: string) => void;
}

export interface ProjectStreamingCallbacks {
  onStart?: () => void;
  onChunk?: (content: string) => void;
  onEnd?: (metadata: { project: any; credits_used: number; credits_balance: number }) => void;
  onError?: (message: string) => void;
}

export interface PresentationStreamingCallbacks {
  onStart?: () => void;
  onChunk?: (content: string) => void;
  onEnd?: (metadata: { presentation: any; credits_used: number; credits_balance: number }) => void;
  onError?: (message: string) => void;
}

export interface ActivityStreamingCallbacks {
  onStart?: () => void;
  onChunk?: (content: string) => void;
  onEnd?: (metadata: { activity: any; credits_used: number; credits_balance: number }) => void;
  onError?: (message: string) => void;
}

export const streamingService = {
  // Send message with streaming response
  sendMessageStream: async (
    message: string, 
    sessionId: string | undefined,
    conversationId?: string,
    callbacks: StreamingCallbacks = {}
  ): Promise<void> => {
    const token = localStorage.getItem('authToken');
    if (!token) {
      throw new Error('No authentication token found');
    }

    // Get the base URL from the API client
    const baseURL = apiClient.defaults.baseURL;
    const response = await fetch(`${baseURL}/ai/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({
        message,
        session_id: sessionId,
        conversation_id: conversationId
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to send message');
    }

    if (!response.body) {
      throw new Error('No response body');
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder();

    try {
      while (true) {
        const { done, value } = await reader.read();
        
        if (done) break;

        const chunk = decoder.decode(value);
        const lines = chunk.split('\n');

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            try {
              const data: StreamingResponse = JSON.parse(line.slice(6));
              
              switch (data.type) {
                case 'start':
                  callbacks.onStart?.();
                  break;
                case 'chunk':
                  if (data.content) {
                    callbacks.onChunk?.(data.content);
                  }
                  break;
                case 'end':
                  if (data.credits_used !== undefined && data.credits_balance !== undefined && data.session_id !== undefined) {
                    callbacks.onEnd?.({
                      credits_used: data.credits_used,
                      credits_balance: data.credits_balance,
                      session_id: data.session_id
                    });
                  }
                  break;
                case 'error':
                  callbacks.onError?.(data.message || 'An error occurred');
                  break;
              }
            } catch (parseError) {
              console.error('Error parsing streaming data:', parseError);
            }
          }
        }
      }
    } finally {
      reader.releaseLock();
    }
  },

  // Generate worksheet with streaming response
  generateWorksheetStream: async (
    topic: string,
    callbacks: WorksheetStreamingCallbacks,
    options?: { question_count?: number; difficulty?: string; teaching_style?: string }
  ): Promise<void> => {
    const token = localStorage.getItem('authToken');
    if (!token) {
      throw new Error('No authentication token found');
    }

    // Get the base URL from the API client
    const baseURL = apiClient.defaults.baseURL;
    const response = await fetch(`${baseURL}/ai/generate-worksheet`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({ topic, ...(options || {}) }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to generate worksheet');
    }

    if (!response.body) {
      throw new Error('No response body');
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder();

    try {
      while (true) {
        const { done, value } = await reader.read();
        
        if (done) break;

        const chunk = decoder.decode(value);
        const lines = chunk.split('\n');

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            try {
              const data: StreamingResponse = JSON.parse(line.slice(6));
              
              switch (data.type) {
                case 'start':
                  callbacks.onStart?.();
                  break;
                case 'chunk':
                  if (data.content) {
                    callbacks.onChunk?.(data.content);
                  }
                  break;
                case 'end':
                  if (data.worksheet && data.credits_used !== undefined && data.credits_balance !== undefined) {
                    callbacks.onEnd?.({
                      worksheet: data.worksheet,
                      credits_used: data.credits_used,
                      credits_balance: data.credits_balance
                    });
                  }
                  break;
                case 'error':
                  callbacks.onError?.(data.message || 'An error occurred');
                  break;
              }
            } catch (parseError) {
              console.error('Error parsing streaming data:', parseError);
            }
          }
        }
      }
    } finally {
      reader.releaseLock();
    }
  }
  ,

  // Generate lesson plan with streaming response
  generateLessonPlanStream: async (
    params: { title?: string; subject?: string; grade_level?: string },
    callbacks: LessonPlanStreamingCallbacks
  ): Promise<void> => {
    const token = localStorage.getItem('authToken');
    if (!token) throw new Error('No authentication token found');
    const baseURL = apiClient.defaults.baseURL;
    const response = await fetch(`${baseURL}/ai/generate-lesson-plan`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
      body: JSON.stringify(params),
    });
    if (!response.ok) throw new Error((await response.json()).error || 'Failed to generate lesson plan');
    if (!response.body) throw new Error('No response body');
    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    try {
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value);
        const lines = chunk.split('\n');
        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data: StreamingResponse = JSON.parse(line.slice(6));
            switch (data.type) {
              case 'start': callbacks.onStart?.(); break;
              case 'chunk': if (data.content) callbacks.onChunk?.(data.content); break;
              case 'end':
                if ((data as any).lesson_plan && data.credits_used !== undefined && data.credits_balance !== undefined) {
                  callbacks.onEnd?.({ lesson_plan: (data as any).lesson_plan, credits_used: data.credits_used!, credits_balance: data.credits_balance! });
                }
                break;
              case 'error': callbacks.onError?.(data.message || 'An error occurred'); break;
            }
          }
        }
      }
    } finally {
      reader.releaseLock();
    }
  },

  // Generate quiz with streaming response
  generateQuizStream: async (
    params: { title?: string; subject?: string; grade_level?: string; question_count?: number },
    callbacks: QuizStreamingCallbacks
  ): Promise<void> => {
    const token = localStorage.getItem('authToken');
    if (!token) throw new Error('No authentication token found');
    const baseURL = apiClient.defaults.baseURL;
    const response = await fetch(`${baseURL}/ai/generate-quiz`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
      body: JSON.stringify(params),
    });
    if (!response.ok) throw new Error((await response.json()).error || 'Failed to generate quiz');
    if (!response.body) throw new Error('No response body');
    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    try {
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value);
        const lines = chunk.split('\n');
        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data: StreamingResponse = JSON.parse(line.slice(6));
            switch (data.type) {
              case 'start': callbacks.onStart?.(); break;
              case 'chunk': if (data.content) callbacks.onChunk?.(data.content); break;
              case 'end':
                if ((data as any).quiz && data.credits_used !== undefined && data.credits_balance !== undefined) {
                  callbacks.onEnd?.({ quiz: (data as any).quiz, credits_used: data.credits_used!, credits_balance: data.credits_balance! });
                }
                break;
              case 'error': callbacks.onError?.(data.message || 'An error occurred'); break;
            }
          }
        }
      }
    } finally {
      reader.releaseLock();
    }
  }
  ,

  // Generate project
  generateProjectStream: async (
    params: { title?: string; subject?: string; grade_level?: string },
    callbacks: ProjectStreamingCallbacks
  ): Promise<void> => {
    const token = localStorage.getItem('authToken');
    if (!token) throw new Error('No authentication token found');
    const baseURL = apiClient.defaults.baseURL;
    const response = await fetch(`${baseURL}/ai/generate-project`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
      body: JSON.stringify(params),
    });
    if (!response.ok) throw new Error((await response.json()).error || 'Failed to generate project');
    if (!response.body) throw new Error('No response body');
    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    try {
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value);
        const lines = chunk.split('\n');
        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data: StreamingResponse = JSON.parse(line.slice(6));
            switch (data.type) {
              case 'start': callbacks.onStart?.(); break;
              case 'chunk': if (data.content) callbacks.onChunk?.(data.content); break;
              case 'end':
                if ((data as any).project && data.credits_used !== undefined && data.credits_balance !== undefined) {
                  callbacks.onEnd?.({ project: (data as any).project, credits_used: data.credits_used!, credits_balance: data.credits_balance! });
                }
                break;
              case 'error': callbacks.onError?.(data.message || 'An error occurred'); break;
            }
          }
        }
      }
    } finally {
      reader.releaseLock();
    }
  },

  // Generate presentation
  generatePresentationStream: async (
    params: { title?: string; subject?: string; grade_level?: string },
    callbacks: PresentationStreamingCallbacks
  ): Promise<void> => {
    const token = localStorage.getItem('authToken');
    if (!token) throw new Error('No authentication token found');
    const baseURL = apiClient.defaults.baseURL;
    const response = await fetch(`${baseURL}/ai/generate-presentation`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
      body: JSON.stringify(params),
    });
    if (!response.ok) throw new Error((await response.json()).error || 'Failed to generate presentation');
    if (!response.body) throw new Error('No response body');
    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    try {
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value);
        const lines = chunk.split('\n');
        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data: StreamingResponse = JSON.parse(line.slice(6));
            switch (data.type) {
              case 'start': callbacks.onStart?.(); break;
              case 'chunk': if (data.content) callbacks.onChunk?.(data.content); break;
              case 'end':
                if ((data as any).presentation && data.credits_used !== undefined && data.credits_balance !== undefined) {
                  callbacks.onEnd?.({ presentation: (data as any).presentation, credits_used: data.credits_used!, credits_balance: data.credits_balance! });
                }
                break;
              case 'error': callbacks.onError?.(data.message || 'An error occurred'); break;
            }
          }
        }
      }
    } finally {
      reader.releaseLock();
    }
  },

  // Generate classroom activity
  generateActivityStream: async (
    params: { title?: string; subject?: string; grade_level?: string; duration?: string },
    callbacks: ActivityStreamingCallbacks
  ): Promise<void> => {
    const token = localStorage.getItem('authToken');
    if (!token) throw new Error('No authentication token found');
    const baseURL = apiClient.defaults.baseURL;
    const response = await fetch(`${baseURL}/ai/generate-activity`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
      body: JSON.stringify(params),
    });
    if (!response.ok) throw new Error((await response.json()).error || 'Failed to generate activity');
    if (!response.body) throw new Error('No response body');
    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    try {
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value);
        const lines = chunk.split('\n');
        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data: StreamingResponse = JSON.parse(line.slice(6));
            switch (data.type) {
              case 'start': callbacks.onStart?.(); break;
              case 'chunk': if (data.content) callbacks.onChunk?.(data.content); break;
              case 'end':
                if ((data as any).activity && data.credits_used !== undefined && data.credits_balance !== undefined) {
                  callbacks.onEnd?.({ activity: (data as any).activity, credits_used: data.credits_used!, credits_balance: data.credits_balance! });
                }
                break;
              case 'error': callbacks.onError?.(data.message || 'An error occurred'); break;
            }
          }
        }
      }
    } finally {
      reader.releaseLock();
    }
  }
}; 