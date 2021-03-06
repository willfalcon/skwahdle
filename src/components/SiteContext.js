import React, { createContext, useContext, useState, useEffect } from 'react';
import produce from 'immer';
import { isSameDay } from 'date-fns';
import NProgress from 'nprogress';
import { differenceInDays, setHours, setMinutes, setSeconds } from 'date-fns';
import { navigate } from 'gatsby';

import updateStats from '../lib/updateStats';
import Alert from './Alert';

import useInitialState from '../lib/initialState';
import checkWord from '../lib/checkWord';
import useKeyStatuses from '../lib/useKeyStatuses';

const SiteContext = createContext();

const SiteContextProvider = ({ children, data }) => {
  const { keyStatuses, figureOutKeyStatuses, setKeyStatuses } = useKeyStatuses(data.word);
  const {
    statsOpen,
    setStatsOpen,
    workingRow,
    setWorkingRow,
    workingBox,
    setWorkingBox,
    letters,
    setLetters,
    attempts,
    setAttempts,
    rowLocks,
    setRowLocks,
    notAWord,
    setNotAWord,
    notAWordModal,
    setNotAWordModal,
    solved,
    setSolved,
    failed,
    setFailed,
    resetState,
    stats,
    setStats,
    disabled,
    setDisabled,
    sessionId,
  } = useInitialState(setKeyStatuses);

  const [found, setFound] = useState('unknown');

  useEffect(() => {
    async function check(attempt) {
      const { found } = await checkWord(attempt.join(''));
      setFound(found ? 'found' : 'gibberish');
    }

    if (workingBox === 5) {
      const tempAttempt = letters[workingRow > 5 ? 5 : workingRow];
      check(tempAttempt);
    } else {
      setFound('unknown');
    }
  }, [letters, workingBox, workingRow]);

  const today = new Date();

  const midnight = setSeconds(setMinutes(setHours(new Date(), 0), 0), 0);
  const edition = differenceInDays(midnight, new Date('2022-02-05'));

  useEffect(() => {
    const lastDate = localStorage.getItem('last-date');
    if (!lastDate) {
      resetState(today);
    } else if (!isSameDay(new Date(lastDate), today)) {
      resetState(today);
    }
    if (failed || solved) {
      navigate('/stats');
    }
  }, []);

  async function logAnswer() {
    if (found === 'gibberish') {
      idiot();
      return;
    }

    setDisabled(true);
    NProgress.start();

    const attempt = letters[workingRow];

    function idiot() {
      setNotAWord(true);
      setNotAWordModal(true);
      setTimeout(() => {
        setNotAWord(false);
      }, 300);
      setTimeout(() => {
        setNotAWordModal(false);
      }, 2000);
      setDisabled(false);
      NProgress.done();
      return;
    }

    if (!attempt.includes('')) {
      const check = await checkWord(attempt.join(''), data.word);
      // console.log(check);
      if (!check.found) {
        idiot();
        return;
      }

      const finishedAttempts = produce(attempts, draft => {
        draft[workingRow] = check.result;
      });

      setAttempts(finishedAttempts);

      const newRowLocks = produce(rowLocks, draft => {
        draft[workingRow] = true;
      });
      setRowLocks(newRowLocks);

      if (check.solved) {
        setWorkingRow(6);
        setWorkingBox(5);
        setSolved(true);
        updateStats(finishedAttempts, true, stats, setStats);
        setTimeout(() => {
          navigate('/stats');
        }, 1000);
      } else {
        const newWorkingRow = workingRow === 6 ? workingRow : workingRow + 1;
        setWorkingRow(newWorkingRow);
        if (newWorkingRow === 6) {
          setFailed(true);
          updateStats(finishedAttempts, false, stats, setStats);

          setTimeout(() => {
            navigate('/stats');
          }, 600);
        }
        setWorkingBox(0);
      }

      figureOutKeyStatuses(attempt);
    }
    setDisabled(false);
    NProgress.done();
  }

  const [alertText, setAlertText] = useState('');
  const [showAlert, setShowAlert] = useState(false);

  const useAlert = (text, duration = 2000) => {
    function trigger() {
      setAlertText(text);
      setShowAlert(true);
      setTimeout(() => {
        setShowAlert(false);
      }, duration);
    }
    return trigger;
  };

  const [instructionsOpen, setInstructionsOpen] = useState(false);

  return (
    <SiteContext.Provider
      value={{
        workingRow,
        setWorkingRow,
        workingBox,
        setWorkingBox,
        letters,
        setLetters,
        attempts,
        logAnswer,
        rowLocks,
        notAWord,
        setNotAWord,
        notAWordModal,
        solved,
        failed,
        statsOpen,
        setStatsOpen,
        useAlert,
        stats,
        setStats,
        disabled,
        setDisabled,
        resetState,
        edition,
        ...data,
        instructionsOpen,
        setInstructionsOpen,
        keyStatuses,
        figureOutKeyStatuses,
        found,
        sessionId,
      }}
    >
      {children}
      <Alert showAlert={showAlert} alertText={alertText} />
    </SiteContext.Provider>
  );
};

const useSiteContext = () => useContext(SiteContext);

export { SiteContextProvider, SiteContext };
export default useSiteContext;
