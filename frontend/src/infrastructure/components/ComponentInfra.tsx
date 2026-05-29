import React from 'react';

/**
 * Infrastructure layer for Frontend Components
 * Provides common functionality like error boundaries, loading states, and telemetry
 */
export interface ComponentInfraProps {
  isLoading?: boolean;
  error?: Error | null;
  retry?: () => void;
}

/**
 * A Higher Order infrastructure component to handle common states
 */
export const withInfrastructure = <P extends object>(
  WrappedComponent: React.ComponentType<P>
) => {
  return (props: P & ComponentInfraProps) => {
    if (props.isLoading) {
      return <div>Loading...</div>; // Could be a premium loader
    }

    if (props.error) {
      return (
        <div className="error-container">
          <p>Something went wrong: {props.error.message}</p>
          <button onClick={props.retry}>Retry</button>
        </div>
      );
    }

    return <WrappedComponent {...props} />;
  };
};
