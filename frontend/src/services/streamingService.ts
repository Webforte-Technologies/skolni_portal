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
  onEnd?: (metadata: { worksheet: any; file_id?: string; file_type?: string; credits_used: number; credits_balance: number }) => void;
  onError?: (message: string) => void;
}

export interface LessonPlanStreamingCallbacks {
  onStart?: () => void;
  onChunk?: (content: string) => void;
  onEnd?: (metadata: { lesson_plan: any; file_id?: string; file_type?: string; credits_used: number; credits_balance: number }) => void;
  onError?: (message: string) => void;
}

export interface QuizStreamingCallbacks {
  onStart?: () => void;
  onChunk?: (content: string) => void;
  onEnd?: (metadata: { quiz: any; file_id?: string; file_type?: string; credits_used: number; credits_balance: number }) => void;
  onError?: (message: string) => void;
}

export interface ProjectStreamingCallbacks {
  onStart?: () => void;
  onChunk?: (content: string) => void;
  onEnd?: (metadata: { project: any; file_id?: string; file_type?: string; credits_used: number; credits_balance: number }) => void;
  onError?: (message: string) => void;
}

export interface PresentationStreamingCallbacks {
  onStart?: () => void;
  onChunk?: (content: string) => void;
  onEnd?: (metadata: { presentation: any; file_id?: string; file_type?: string; credits_used: number; credits_balance: number }) => void;
  onError?: (message: string) => void;
}

export interface ActivityStreamingCallbacks {
  onStart?: () => void;
  onChunk?: (content: string) => void;
  onEnd?: (metadata: { activity: any; file_id?: string; file_type?: string; credits_used: number; credits_balance: number }) => void;
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
      // eslint-disable-next-line no-constant-condition
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
    options?: { 
      question_count?: number; 
      difficulty?: string; 
      teaching_style?: string;
      exercise_types?: string[];
      include_answers?: boolean;
      assignment_description?: string;
      subtype_id?: string;
      quality_level?: 'základní' | 'standardní' | 'vysoká' | 'expertní';
      custom_instructions?: string;
    }
  ): Promise<void> => {
    const token = localStorage.getItem('authToken');
    if (!token) {
      throw new Error('No authentication token found');
    }

    // Get the base URL from the API client
    const baseURL = apiClient.defaults.baseURL;
    console.log('Generating worksheet with baseURL:', baseURL);
    console.log('Topic:', topic);
    console.log('Options:', options);
    
    const doRequest = async (signal?: AbortSignal): Promise<Response> => {
      return fetch(`${baseURL}/ai/generate-worksheet`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ topic, ...(options || {}) }),
        signal,
      });
    };
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 60000);
    let response = await doRequest(controller.signal);
    if (!response.ok && response.status >= 500) {
      // backoff then retry once for transient server errors
      await new Promise((r) => setTimeout(r, 500));
      response = await doRequest(controller.signal);
    }
    clearTimeout(timeout);

    console.log('Response status:', response.status);
    console.log('Response headers:', Object.fromEntries(response.headers.entries()));

    if (!response.ok) {
      const errorData = await response.json();
      console.error('Response not ok:', errorData);
      throw new Error(errorData.error || 'Failed to generate worksheet');
    }

    if (!response.body) {
      console.error('No response body');
      throw new Error('No response body');
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder();

    try {
      console.log('Starting to read stream...');
      // eslint-disable-next-line no-constant-condition
      while (true) {
        const { done, value } = await reader.read();
        
        if (done) {
          console.log('Stream done');
          break;
        }

        const chunk = decoder.decode(value);
        console.log('Received chunk:', chunk);
        const lines = chunk.split('\n');

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            try {
              const data: StreamingResponse = JSON.parse(line.slice(6));
              switch (data.type) {
                case 'start': callbacks.onStart?.(); break;
                case 'chunk': if (data.content) callbacks.onChunk?.(data.content); break;
                case 'end':
                  if ((data as any).worksheet && data.credits_used !== undefined && data.credits_balance !== undefined) {
                    callbacks.onEnd?.({ worksheet: (data as any).worksheet, file_id: (data as any).file_id, file_type: (data as any).file_type, credits_used: data.credits_used!, credits_balance: data.credits_balance! });
                  }
                  break;
                case 'error': callbacks.onError?.(data.message || 'An error occurred'); break;
              }
            } catch (parseError) {
              console.error('Failed to parse SSE data:', parseError, 'Raw line:', line);
              // Try to extract any useful information from the malformed line
              if (line.includes('error') || line.includes('Error')) {
                callbacks.onError?.('Received malformed response from server');
              }
            }
          }
        }
      }
    } finally {
      reader.releaseLock();
    }
  },

  // Generate lesson plan with streaming response
  generateLessonPlanStream: async (
    params: { 
      title?: string; 
      subject?: string; 
      grade_level?: string;
      assignment_description?: string;
      subtype_id?: string;
      duration?: string;
      class_size?: number;
      teaching_methods?: string[];
      available_resources?: string[];
      quality_level?: 'základní' | 'standardní' | 'vysoká' | 'expertní';
      custom_instructions?: string;
    },
    callbacks: LessonPlanStreamingCallbacks
  ): Promise<void> => {
    const token = localStorage.getItem('authToken');
    if (!token) throw new Error('No authentication token found');
    const baseURL = apiClient.defaults.baseURL;
    const doRequest = async (signal?: AbortSignal): Promise<Response> => {
      return fetch(`${baseURL}/ai/generate-lesson-plan`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify(params),
        signal,
      });
    };
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 60000);
    let response = await doRequest(controller.signal);
    if (!response.ok && response.status >= 500) {
      await new Promise((r) => setTimeout(r, 500));
      response = await doRequest(controller.signal);
    }
    clearTimeout(timeout);
    if (!response.ok) throw new Error((await response.json()).error || 'Failed to generate lesson plan');
    if (!response.body) throw new Error('No response body');
    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    try {
      // eslint-disable-next-line no-constant-condition
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
                case 'start': callbacks.onStart?.(); break;
                case 'chunk': if (data.content) callbacks.onChunk?.(data.content); break;
                case 'end':
                  if ((data as any).lesson_plan && data.credits_used !== undefined && data.credits_balance !== undefined) {
                    callbacks.onEnd?.({ lesson_plan: (data as any).lesson_plan, file_id: (data as any).file_id, file_type: (data as any).file_type, credits_used: data.credits_used!, credits_balance: data.credits_balance! });
                  }
                  break;
                case 'error': callbacks.onError?.(data.message || 'An error occurred'); break;
              }
            } catch (parseError) {
              console.error('Failed to parse SSE data:', parseError, 'Raw line:', line);
              // Try to extract any useful information from the malformed line
              if (line.includes('error') || line.includes('Error')) {
                callbacks.onError?.('Received malformed response from server');
              }
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
    params: { 
      title?: string; 
      subject?: string; 
      grade_level?: string; 
      question_count?: number; 
      time_limit?: string | number; 
      prompt_hint?: string;
      assignment_description?: string;
      subtype_id?: string;
      question_types?: string[];
      cognitive_levels?: string[];
      quality_level?: 'základní' | 'standardní' | 'vysoká' | 'expertní';
      custom_instructions?: string;
    },
    callbacks: QuizStreamingCallbacks
  ): Promise<void> => {
    const token = localStorage.getItem('authToken');
    if (!token) throw new Error('No authentication token found');
    const baseURL = apiClient.defaults.baseURL;
    const doRequest = async (signal?: AbortSignal): Promise<Response> => {
      return fetch(`${baseURL}/ai/generate-quiz`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify(params),
        signal,
      });
    };
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 60000);
    let response = await doRequest(controller.signal);
    if (!response.ok && response.status >= 500) {
      await new Promise((r) => setTimeout(r, 500));
      response = await doRequest(controller.signal);
    }
    clearTimeout(timeout);
    if (!response.ok) throw new Error((await response.json()).error || 'Failed to generate quiz');
    if (!response.body) throw new Error('No response body');
    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    try {
      // eslint-disable-next-line no-constant-condition
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
                case 'start': callbacks.onStart?.(); break;
                case 'chunk': if (data.content) callbacks.onChunk?.(data.content); break;
                case 'end':
                  if ((data as any).quiz && data.credits_used !== undefined && data.credits_balance !== undefined) {
                    callbacks.onEnd?.({ quiz: (data as any).quiz, file_id: (data as any).file_id, file_type: (data as any).file_type, credits_used: data.credits_used!, credits_balance: data.credits_balance! });
                  }
                  break;
                case 'error': callbacks.onError?.(data.message || 'An error occurred'); break;
              }
            } catch (parseError) {
              console.error('Failed to parse SSE data:', parseError, 'Raw line:', line);
              // Try to extract any useful information from the malformed line
              if (line.includes('error') || line.includes('Error')) {
                callbacks.onError?.('Received malformed response from server');
              }
            }
          }
        }
      }
    } finally {
      reader.releaseLock();
    }
  },

  // Generate project
  generateProjectStream: async (
    params: { 
      title?: string; 
      subject?: string; 
      grade_level?: string;
      assignment_description?: string;
      subtype_id?: string;
      duration?: string;
      project_type?: string;
      group_size?: number;
      assessment_criteria?: string[];
      quality_level?: 'základní' | 'standardní' | 'vysoká' | 'expertní';
      custom_instructions?: string;
    },
    callbacks: ProjectStreamingCallbacks
  ): Promise<void> => {
    const token = localStorage.getItem('authToken');
    if (!token) throw new Error('No authentication token found');
    const baseURL = apiClient.defaults.baseURL;
    const doRequest = async (signal?: AbortSignal): Promise<Response> => {
      return fetch(`${baseURL}/ai/generate-project`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify(params),
        signal,
      });
    };
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 60000);
    let response = await doRequest(controller.signal);
    if (!response.ok && response.status >= 500) {
      await new Promise((r) => setTimeout(r, 500));
      response = await doRequest(controller.signal);
    }
    clearTimeout(timeout);
    if (!response.ok) throw new Error((await response.json()).error || 'Failed to generate project');
    if (!response.body) throw new Error('No response body');
    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    try {
      // eslint-disable-next-line no-constant-condition
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
                case 'start': callbacks.onStart?.(); break;
                case 'chunk': if (data.content) callbacks.onChunk?.(data.content); break;
                case 'end':
                  if ((data as any).project && data.credits_used !== undefined && data.credits_balance !== undefined) {
                    callbacks.onEnd?.({ project: (data as any).project, file_id: (data as any).file_id, file_type: (data as any).file_type, credits_used: data.credits_used!, credits_balance: data.credits_balance! });
                  }
                  break;
                case 'error': callbacks.onError?.(data.message || 'An error occurred'); break;
              }
            } catch (parseError) {
              console.error('Failed to parse SSE data:', parseError, 'Raw line:', line);
              // Try to extract any useful information from the malformed line
              if (line.includes('error') || line.includes('Error')) {
                callbacks.onError?.('Received malformed response from server');
              }
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
    params: { 
      title?: string; 
      subject?: string; 
      grade_level?: string;
      assignment_description?: string;
      subtype_id?: string;
      slide_count?: number;
      presentation_style?: string;
      target_audience?: string;
      quality_level?: 'základní' | 'standardní' | 'vysoká' | 'expertní';
      custom_instructions?: string;
    },
    callbacks: PresentationStreamingCallbacks
  ): Promise<void> => {
    const token = localStorage.getItem('authToken');
    if (!token) throw new Error('No authentication token found');
    const baseURL = apiClient.defaults.baseURL;
    const doRequest = async (signal?: AbortSignal): Promise<Response> => {
      return fetch(`${baseURL}/ai/generate-presentation`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify(params),
        signal,
      });
    };
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 60000);
    let response = await doRequest(controller.signal);
    if (!response.ok && response.status >= 500) {
      await new Promise((r) => setTimeout(r, 500));
      response = await doRequest(controller.signal);
    }
    clearTimeout(timeout);
    if (!response.ok) throw new Error((await response.json()).error || 'Failed to generate presentation');
    if (!response.body) throw new Error('No response body');
    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    try {
      // eslint-disable-next-line no-constant-condition
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
                case 'start': callbacks.onStart?.(); break;
                case 'chunk': if (data.content) callbacks.onChunk?.(data.content); break;
                case 'end':
                  if ((data as any).presentation && data.credits_used !== undefined && data.credits_balance !== undefined) {
                    callbacks.onEnd?.({ presentation: (data as any).presentation, file_id: (data as any).file_id, file_type: (data as any).file_type, credits_used: data.credits_used!, credits_balance: data.credits_balance! });
                  }
                  break;
                case 'error': callbacks.onError?.(data.message || 'An error occurred'); break;
              }
            } catch (parseError) {
              console.error('Failed to parse SSE data:', parseError, 'Raw line:', line);
              // Try to extract any useful information from the malformed line
              if (line.includes('error') || line.includes('Error')) {
                callbacks.onError?.('Received malformed response from server');
              }
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
    params: { 
      title?: string; 
      subject?: string; 
      grade_level?: string; 
      duration?: string;
      assignment_description?: string;
      subtype_id?: string;
      activity_type?: string;
      group_size?: number;
      required_materials?: string[];
      quality_level?: 'základní' | 'standardní' | 'vysoká' | 'expertní';
      custom_instructions?: string;
    },
    callbacks: ActivityStreamingCallbacks
  ): Promise<void> => {
    const token = localStorage.getItem('authToken');
    if (!token) throw new Error('No authentication token found');
    const baseURL = apiClient.defaults.baseURL;
    const doRequest = async (signal?: AbortSignal): Promise<Response> => {
      return fetch(`${baseURL}/ai/generate-activity`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify(params),
        signal,
      });
    };
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 60000);
    let response = await doRequest(controller.signal);
    if (!response.ok && response.status >= 500) {
      await new Promise((r) => setTimeout(r, 500));
      response = await doRequest(controller.signal);
    }
    clearTimeout(timeout);
    if (!response.ok) throw new Error((await response.json()).error || 'Failed to generate activity');
    if (!response.body) throw new Error('No response body');
    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    try {
      // eslint-disable-next-line no-constant-condition
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
                case 'start': callbacks.onStart?.(); break;
                case 'chunk': if (data.content) callbacks.onChunk?.(data.content); break;
                case 'end':
                  if ((data as any).activity && data.credits_used !== undefined && data.credits_balance !== undefined) {
                    callbacks.onEnd?.({ activity: (data as any).activity, file_id: (data as any).file_id, file_type: (data as any).file_type, credits_used: data.credits_used!, credits_balance: data.credits_balance! });
                  }
                  break;
                case 'error': callbacks.onError?.(data.message || 'An error occurred'); break;
              }
            } catch (parseError) {
              console.error('Failed to parse SSE data:', parseError, 'Raw line:', line);
              // Try to extract any useful information from the malformed line
              if (line.includes('error') || line.includes('Error')) {
                callbacks.onError?.('Received malformed response from server');
              }
            }
          }
        }
      }
    } finally {
      reader.releaseLock();
    }
  }
}; 