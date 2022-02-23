import React, { useContext, useEffect, useState } from 'react';
import styled from 'styled-components';

import { KeyboardContext } from './KeyBoardHandling';
import useSiteContext from '../SiteContext';

const Key = ({ children, exampleStatus = false }) => {
  const { setNextLetter } = useContext(KeyboardContext);
  const { letters, attempts, disabled, keyStatuses } = useSiteContext();

  const [keyStatus, setStatus] = useState('unused');

  useEffect(() => {
    if (keyStatuses) {
      keyStatuses.forEach(status => {
        const keys = status.filter(status => status.key == children);
        console.log(keys);
        if (keys.length && keys[0].status !== keyStatus) {
          setStatus(keys[0].status);
        }
      });
    }
  }, []);
  useEffect(() => {
    if (keyStatuses.length) {
      const keys = keyStatuses[keyStatuses.length - 1].filter(status => status.key == children);
      if (keys.length && keys[0].status !== keyStatus) {
        setStatus(keys[0].status);
      }
    } else {
      setStatus('unused');
    }
  }, [keyStatuses]);

  return (
    <StyledKey
      onClick={e => {
        setNextLetter(e.target.dataset.key);
      }}
      data-key={children}
      status={exampleStatus || keyStatus}
      className="key"
      aria-disabled={disabled}
      disabled={disabled}
    >
      {children}
    </StyledKey>
  );
};

const StyledKey = styled.button`
  height: 53px;
  font-weight: bold;
  margin-right: 6px;
  border-radius: 4px;
  background: ${({ theme }) => theme.light};
  opacity: ${({ disabled }) => (disabled ? 0.75 : 1)};
  transition: 0.25s;
  transition-delay: 0.75s;
  background: ${({ theme, status }) =>
    status
      ? status === 'wrong'
        ? theme.wrong
        : status === 'kinda'
        ? theme.yellow
        : status === 'correct'
        ? theme.green
        : theme.light
      : theme.light};
  color: dark;
  color: ${({ theme, status }) =>
    status
      ? status === 'wrong'
        ? theme.white
        : status === 'kinda'
        ? theme.white
        : status === 'correct'
        ? theme.white
        : theme.dark
      : theme.dark};
  border-width: 0;
  text-transform: uppercase;
  font-size: 1.1rem;
  width: 22px;
  padding: 0.5rem;
  &:last-child {
    margin-right: 0;
  }
  @media (min-width: 360px) {
    padding: 1rem;
    font-size: 1.4rem;
    width: 35px;
  }
  @media (min-width: 768px) {
    padding: 2rem;
    font-size: 1.8rem;
    height: 58px;
  }
  cursor: pointer;
`;

export { StyledKey };
export default Key;
