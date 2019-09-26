import React from 'react'
import { Row, Col, Icon, Result, Button, Select } from 'antd'
import { UnControlled as CodeMirror } from 'react-codemirror2'

import * as actionCreators from '../../redux/actions/index'
import { ThunkDispatch } from 'redux-thunk'
import { connect } from 'react-redux'
import { AnyAction } from 'redux'
import { Link } from 'react-router-dom'

import 'codemirror/lib/codemirror.css'

import 'codemirror/theme/monokai.css'
import 'codemirror/theme/solarized.css'
import 'codemirror/theme/material.css'

import 'codemirror/mode/clike/clike.js'
import 'codemirror/mode/python/python.js'
import 'codemirror/addon/selection/active-line.js'
import 'codemirror/addon/fold/foldgutter.css'
import 'codemirror/addon/fold/foldgutter.js'
import 'codemirror/addon/fold/brace-fold.js'
import 'codemirror/addon/fold/indent-fold.js'

const { Option } = Select
// const responsive = `(max-width: 767px)`

const languageData = [['text/x-csrc', 'C / C++'], ['python', 'Python']]

type tplot = {
  [key: string]: string
}

const mapLanguage: { [key: string]: string } = {
  'text/x-csrc': 'cpp',
  python: 'python'
}

const themeData = [
  ['material', 'Material'],
  ['monokai', 'Monokai'],
  ['solarized', 'Solarized Light']
]

interface ISubmitProps {
  problemID: string
  errorSubmit: () => void
  reSubmit: () => void
  user: firebase.User
  submit: (
    uid: string,
    problemID: string,
    code: string,
    language: string
  ) => void
  UID: string
  submissionResponse: number
}

class SubmitComponent extends React.Component<ISubmitProps, any> {
  state = {
    language: 'text/x-csrc',
    theme: 'material',
    code: ''
  }
  changeLanguage = (value: string) => {
    this.setState({ language: value })
  }
  changeEditor = (editor: any, value: any, code: any) => {
    this.setState({ code: code })
  }
  changeTheme = (value: string) => {
    this.setState({ theme: value })
  }
  submitCode = () => {
    const user = this.props.user
    if (!user) {
      this.props.errorSubmit()
      return
    }
    this.props.submit(
      user.uid,
      this.props.problemID,
      this.state.code,
      mapLanguage[this.state.language]
    )
  }
  render() {
    return (
      <React.Fragment>
        {this.props.submissionResponse === -1 ? (
          <Result
            status="success"
            icon={<Icon type="loading" />}
            title="Submiting"
          />
        ) : this.props.submissionResponse === 200 ? (
          <Result
            title="Submission Successful"
            status="success"
            extra={[
              <Link to={'/submissions/' + this.props.UID}>
                <Button type="primary">View Submission</Button>
              </Link>,
              <Button onClick={this.props.reSubmit}>Resubmit</Button>
            ]}
          />
        ) : this.props.submissionResponse !== 0 ? (
          <Result
            status="error"
            title="Submission Failed"
            extra={[<Button onClick={this.props.reSubmit}>Resubmit</Button>]}
          />
        ) : (
          <React.Fragment>
            <h1>Submit Code</h1>
            <Row>
              <Col span={6}>
                <Select
                  defaultValue={languageData[0][0]}
                  style={{ width: 120 }}
                  onChange={this.changeLanguage}
                >
                  {languageData.map((data: any) => (
                    <Option key={data[0]}>{data[1]}</Option>
                  ))}
                </Select>
              </Col>
              <Col span={14} />
              <Col span={4}>
                <Select
                  defaultValue={themeData[0][0]}
                  style={{ width: 120 }}
                  onChange={this.changeTheme}
                >
                  {themeData.map((data: any) => (
                    <Option key={data[0]}>{data[1]}</Option>
                  ))}
                </Select>
              </Col>
            </Row>
            <CodeMirror
              options={{
                mode: `${this.state.language}`,
                theme: `${this.state.theme}`,
                lineNumbers: true,
                foldGutter: true,
                gutters: ['CodeMirror-linenumbers', 'CodeMirror-foldgutter'],
                lineWrapping: true
              }}
              onChange={this.changeEditor}
            />
            <Button
              type="primary"
              onClick={this.submitCode}
              disabled={this.props.user ? false : true}
            >
              Submit
            </Button>
          </React.Fragment>
        )}
      </React.Fragment>
    )
  }
}

const mapStateToProps: (state: any) => any = state => {
  return {
    submissionResponse: state.submissions.submissionResponse,
    UID: state.submissions.submissionUID,
    user: state.user.user
  }
}

const mapDispatchToProps: (
  dispatch: ThunkDispatch<{}, {}, AnyAction>
) => any = dispatch => {
  return {
    submit: (
      uid: string,
      problem_id: string,
      code: string,
      language: string
    ) => {
      dispatch(actionCreators.makeSubmission(uid, problem_id, code, language))
    },
    reSubmit: () => dispatch(actionCreators.resubmitSubmission()),
    errorSubmit: () => dispatch(actionCreators.errorSubmit())
  }
}

export const SubmitPage = connect(
  mapStateToProps,
  mapDispatchToProps
)(SubmitComponent) as any
