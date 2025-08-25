import React from 'react';
import styled, { keyframes } from 'styled-components';

const spin = keyframes`
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
`;

const Spinner = styled.div`
  border: 4px solid #f3f3f3;
  border-top: 4px solid #3498db;
  border-radius: 50%;
  width: 50px;
  height: 50px;
  animation: ${spin} 2s linear infinite;
  margin: 20px auto;
`;

const Container = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 40px;
`;

interface LoadingSpinnerProps {
  message?: string;
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ 
  message = "Loading..." 
}) => {
  return (
    <Container>
      <div>
        <Spinner />
        <p style={{ textAlign: 'center', color: '#666' }}>{message}</p>
      </div>
    </Container>
  );
};
