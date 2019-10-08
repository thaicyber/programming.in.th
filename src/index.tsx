import React, { Suspense, lazy } from 'react'
import ReactDOM from 'react-dom'
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom'
import { Layout } from 'antd'
import firebase from 'firebase/app'
import 'firebase/functions'
import 'firebase/firestore'
import styled from 'styled-components'

import { Nav } from './components/nav/Nav'
import { CustomSpin } from './components/Spin'

import { AnyAction } from 'redux'
import { ThunkDispatch } from 'redux-thunk'
import { Provider, connect } from 'react-redux'
import * as actionCreators from './redux/actions/index'
import { firebaseConfig } from './config'
import { store } from './redux'

import { openNotificationWithIcon } from './components/Notification'

import { GlobalStyle } from './design'
import './assets/css/init.css'

if (!firebase.apps.length) {
  firebase.initializeApp(firebaseConfig)
  firebase.app().functions('asia-east2')
}

function LazyComponent(Component: any) {
  return (props: any) => (
    <Suspense fallback={<CustomSpin />}>
      <Component {...props} />
    </Suspense>
  )
}

const Index = LazyComponent(
  lazy(() =>
    import(/* webpackChunkName: "index.page" */ './pages/Index').then(
      module => ({ default: module.Index })
    )
  )
)

const NotFound = LazyComponent(
  lazy(() =>
    import(/* webpackChunkName: "not-found.page" */ './pages/404').then(
      module => ({ default: module.NotFound })
    )
  )
)

const LearnPage = LazyComponent(
  lazy(() =>
    import(/* webpackChunkName: "learn.page" */ './pages/Learn').then(
      module => ({ default: module.LearnPage })
    )
  )
)

const TasksPage = LazyComponent(
  lazy(() =>
    import(/* webpackChunkName: "tasks.page" */ './pages/Tasks').then(
      module => ({ default: module.TasksPage })
    )
  )
)

const TaskDetailPage = LazyComponent(
  lazy(() =>
    import(
      /* webpackChunkName: "task-detail.page" */ './pages/TaskDetail'
    ).then(module => ({ default: module.TaskDetailPage }))
  )
)

const SubmissionsPage = LazyComponent(
  lazy(() =>
    import(
      /* webpackChunkName: "submissions.page" */ './pages/Submissions'
    ).then(module => ({ default: module.SubmissionsPage }))
  )
)

const SubmissionDetailPage = LazyComponent(
  lazy(() =>
    import(
      /* webpackChunkName: "submission-detail.page" */ './pages/SubmissionDetail'
    ).then(module => ({ default: module.SubmissionDetailPage }))
  )
)

const SettingPage = LazyComponent(
  lazy(() =>
    import(/* webpackChunkName: "setting.page" */ './pages/Setting').then(
      module => ({ default: module.SettingPage })
    )
  )
)

const Login = LazyComponent(
  lazy(() =>
    import(/* webpackChunkName: "login.page" */ './pages/Login').then(
      module => ({ default: module.Login })
    )
  )
)

const Register = LazyComponent(
  lazy(() =>
    import(/* webpackChunkName: "register.page" */ './pages/Register').then(
      module => ({ default: module.Register })
    )
  )
)

const db = firebase.firestore()

const { Header, Content, Footer } = Layout

const NavHeader = styled(Header)<{ top: boolean }>`
  background: ${props => (props.top ? 'transparent' : 'white')};
  position: fixed;
  z-index: 100;
  width: 100%;
`

const CustomLayout = styled(Layout)`
  min-height: 100vh;
`

interface IRootProps {
  onInitialLoad: () => void
  loadCurrentSubmissionData: (submission_id: string) => void
  resetCurrentSubmissionUID: () => void
  user: 'LOADING' | firebase.User | null
  currentSubmissionUID: string
}

interface IRootStates {
  top: boolean
  checkNoti: boolean
  old_submission_id: string
}

class Root extends React.Component<IRootProps, IRootStates> {
  state: IRootStates = {
    top: true,
    checkNoti: false,
    old_submission_id: ''
  }

  checkScrollPosition = () => {
    const { pageYOffset } = window

    if (pageYOffset > 20) {
      this.setState({ top: false })
    } else if (pageYOffset === 0) {
      this.setState({ top: true })
    }
  }

  componentDidMount() {
    this.props.onInitialLoad()
    window.addEventListener('scroll', this.checkScrollPosition)
  }

  componentWillUnmount() {
    window.removeEventListener('scroll', this.checkScrollPosition)
  }

  componentDidUpdate() {
    if (
      this.props.currentSubmissionUID !== undefined &&
      this.state.checkNoti === false
    ) {
      this.setState({
        checkNoti: true,
        old_submission_id: this.props.currentSubmissionUID
      })
      this.state.checkNoti = true
      db.collection('submissions')
        .doc(this.props.currentSubmissionUID)
        .onSnapshot(doc => {
          const data = doc.data()
          if (data != null) {
            if (data.status !== 'in_queue') {
              openNotificationWithIcon(
                'success',
                'Submission Successful',
                'Done!',
                this.props.currentSubmissionUID
              )
              this.props.resetCurrentSubmissionUID()
              this.props.loadCurrentSubmissionData(this.state.old_submission_id)
              this.setState({ checkNoti: false })
            }
          }
        })
    }
  }

  render() {
    return (
      <React.Fragment>
        {this.props.user === 'LOADING' ? (
          <CustomSpin />
        ) : (
          <Router>
            <CustomLayout>
              <GlobalStyle />
              <NavHeader top={this.state.top}>
                <Nav />
              </NavHeader>
              <Content style={{ marginTop: 64 }}>
                <Switch>
                  <Route exact path="/" component={Index} />
                  <Route exact path="/tasks" component={TasksPage} />
                  <Route exact path="/tasks/:id" component={TaskDetailPage} />
                  <Route
                    exact
                    path="/submissions"
                    component={SubmissionsPage}
                  />
                  <Route
                    exact
                    path="/submissions/:id"
                    component={SubmissionDetailPage}
                  />
                  <Route exact path="/login" component={Login} />
                  <Route exact path="/register" component={Register} />
                  <Route exact path="/learn" component={LearnPage} />
                  <Route
                    exact
                    path="/learn/:article_id"
                    component={LearnPage}
                  />
                  <Route exact path="/setting" component={SettingPage} />
                  <Route component={NotFound} />
                </Switch>
              </Content>
            </CustomLayout>
            <Footer style={{ textAlign: 'center' }}>
              IPST ©2019 | Contribute: All the source code for this website is
              available on Github
            </Footer>
          </Router>
        )}
      </React.Fragment>
    )
  }
}

const mapStateToProps: (state: any) => any = state => {
  return {
    user: state.user.user,
    currentSubmissionUID: state.submissions.currentSubmissionUID
  }
}

const mapDispatchToProps: (
  dispatch: ThunkDispatch<{}, {}, AnyAction>
) => any = dispatch => {
  return {
    onInitialLoad: () => {
      dispatch(actionCreators.fetchUser())
    },
    loadCurrentSubmissionData: (submission_id: string) => {
      dispatch(actionCreators.loadDetail(submission_id))
    },
    resetCurrentSubmissionUID: () => {
      dispatch(actionCreators.resetCurrentSubmission())
    }
  }
}

const RootPage = connect(
  mapStateToProps,
  mapDispatchToProps
)(Root) as any

ReactDOM.render(
  <Provider store={store}>
    <RootPage />
  </Provider>,
  document.getElementById('react') as HTMLElement
)
