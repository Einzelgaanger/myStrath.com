import { QueryClient, QueryFunction } from "@tanstack/react-query";
import { toast } from "@/hooks/use-toast";

/**
 * Enhanced error handling for API responses
 * Extracts error message and throws with appropriate context
 */
async function throwIfResNotOk(res: Response) {
  if (!res.ok) {
    let errorMessage = '';
    try {
      // Try to parse JSON error response first
      const contentType = res.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        const errorData = await res.json();
        errorMessage = errorData.message || errorData.error || JSON.stringify(errorData);
      } else {
        // Fall back to text response
        errorMessage = await res.text();
      }
    } catch (e) {
      // If we can't parse the error, use status text
      errorMessage = res.statusText;
    }

    // Format user-friendly error message
    const error = new Error(`${res.status}: ${errorMessage}`);
    // Add status code for easier handling
    (error as any).statusCode = res.status;
    throw error;
  }
}

export async function apiRequest(
  method: string,
  url: string,
  data?: unknown | undefined,
  options?: { isFormData?: boolean }
): Promise<Response> {
  const isFormData = options?.isFormData || false;
  
  // Don't set Content-Type for FormData, the browser will automatically set it with the boundary
  const headers: HeadersInit = {};
  if (data && !isFormData) {
    headers["Content-Type"] = "application/json";
  }
  
  const res = await fetch(url, {
    method,
    headers,
    body: data 
      ? isFormData 
        ? data as FormData 
        : JSON.stringify(data) 
      : undefined,
    credentials: "include",
  });

  // Don't throw for 401 in this function since we handle it in the caller
  if (res.status !== 401) {
    await throwIfResNotOk(res);
  }
  
  return res;
}

type UnauthorizedBehavior = "returnNull" | "throw";
export const getQueryFn: <T>(options: {
  on401: UnauthorizedBehavior;
}) => QueryFunction<T> =
  ({ on401: unauthorizedBehavior }) =>
  async ({ queryKey }) => {
    const res = await fetch(queryKey[0] as string, {
      credentials: "include",
    });

    if (unauthorizedBehavior === "returnNull" && res.status === 401) {
      return null;
    }

    await throwIfResNotOk(res);
    return await res.json();
  };

/**
 * Global error handler for queries and mutations
 * @param error The error thrown by the query or mutation
 */
export const handleQueryError = (error: unknown) => {
  if (error instanceof Error) {
    // Check for specific status codes
    const statusCode = (error as any).statusCode;
    
    // Handle specific error types
    if (statusCode === 403) {
      toast({
        title: "Access Denied",
        description: "You don't have permission to perform this action.",
        variant: "destructive",
      });
    } else if (statusCode === 404) {
      toast({
        title: "Not Found",
        description: "The requested resource could not be found.",
        variant: "destructive",
      });
    } else if (statusCode === 429) {
      toast({
        title: "Too Many Requests",
        description: "Please slow down and try again later.",
        variant: "destructive",
      });
    } else if (statusCode >= 500) {
      toast({
        title: "Server Error",
        description: "Something went wrong on our end. Please try again later.",
        variant: "destructive",
      });
    } else {
      // Generic error handling
      toast({
        title: "Error",
        description: error.message || "An unexpected error occurred",
        variant: "destructive",
      });
    }
  } else {
    // Handle non-Error objects
    toast({
      title: "Error",
      description: "An unexpected error occurred",
      variant: "destructive",
    });
  }
};

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      queryFn: getQueryFn({ on401: "throw" }),
      refetchInterval: 0, // 0 means disabled
      refetchOnWindowFocus: false,
      staleTime: 60 * 1000, // 1 minute
      retry: (failureCount: number, error: unknown) => {
        // Only retry network-related errors, not 4xx/5xx responses
        const statusCode = (error as any)?.statusCode;
        return !statusCode && failureCount < 2;
      }
    },
    mutations: {
      retry: false,
    },
  }
});

// We can't use the subscribe approach directly, so we'll create a custom error handling wrapper
export function withErrorHandling<T>(queryFn: () => Promise<T>): () => Promise<T> {
  return async () => {
    try {
      return await queryFn();
    } catch (error) {
      handleQueryError(error);
      throw error;
    }
  };
}

// Wrapper for mutation functions
export function withMutationErrorHandling<TData, TVariables>(
  mutationFn: (variables: TVariables) => Promise<TData>
): (variables: TVariables) => Promise<TData> {
  return async (variables) => {
    try {
      return await mutationFn(variables);
    } catch (error) {
      handleQueryError(error);
      throw error;
    }
  };
}

// This can be used like: 
// useQuery({ queryKey: ['/api/data'], queryFn: withErrorHandling(() => fetchData()) });
// useMutation({ mutationFn: withMutationErrorHandling((data) => updateData(data)) });
