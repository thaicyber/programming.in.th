import { NextPage } from 'next'
import { AppProps } from 'next/app'
import Router from 'next/router'
import React, { useReducer, useEffect } from 'react'
import useSWR, { mutate } from 'swr'
import NProgress from 'nprogress'
import { ThemeProvider, CSSReset } from '@chakra-ui/core'

import firebase from 'lib/firebase'
import {
  UserState,
  initialState,
  reducer,
  UserAction,
  UserStateContext,
  IContext,
} from 'components/UserContext'
import { onetap } from 'components/auth/onetap'

import { GlobalStyle } from 'design'
import { customTheme } from 'design/theme'

import 'codemirror/lib/codemirror.css'

import 'codemirror/theme/monokai.css'
import 'codemirror/theme/solarized.css'
import 'codemirror/theme/material.css'
import 'codemirror/addon/fold/foldgutter.css'

import 'assets/css/prism.css'
import { fetchFromFirebase } from 'utils/fetcher'

let timeout: any

const start = () => {
  timeout = setTimeout(NProgress.start, 300)
}

const done = () => {
  clearTimeout(timeout)
  NProgress.done()
}

Router.events.on('routeChangeStart', start)
Router.events.on('routeChangeComplete', done)
Router.events.on('routeChangeError', done)

const App: NextPage<AppProps> = ({ Component, pageProps }) => {
  const [userState, userDispatch] = useReducer<
    React.Reducer<UserState, UserAction>
  >(reducer, initialState)

  const { data: userContext } = useSWR('getUserContext', fetchFromFirebase, {
    refreshInterval: 1000 * 60,
  })

  useEffect(() => {
    const unsubscribe = firebase.auth().onAuthStateChanged((user) => {
      if (user === null || user.emailVerified) {
        userDispatch({
          type: 'RECEIVE_USER',
          payload: {
            user,
          },
        })
      }
    })

    return () => unsubscribe()
  }, [])

  useEffect(() => {
    if (userState.user) {
      const unsubscribe = firebase
        .firestore()
        .collection('users')
        .doc(userState.user.uid)
        .onSnapshot((doc) => {
          const data = doc.data() as IContext
          if (data) userDispatch({ type: 'RECEIVE_CONTEXT', payload: data })
        })
      return () => unsubscribe()
    } else {
      userDispatch({ type: 'RECEIVE_CONTEXT', payload: initialState })
    }
  }, [userState.user])

  useEffect(() => {
    if (userContext) {
      userDispatch({
        type: 'RECEIVE_CONTEXT',
        payload: userContext,
      })
    }
  }, [userContext])

  useEffect(() => {
    if (userState.user === null) {
      onetap()
    }
  }, [userState.user])

  return (
    <ThemeProvider theme={customTheme}>
      <UserStateContext.Provider value={userState}>
        <CSSReset />
        <GlobalStyle />
        <Component {...pageProps} />
      </UserStateContext.Provider>
    </ThemeProvider>
  )
}

export default App
