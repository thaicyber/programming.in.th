/* React */
import React from 'react'

/* Redux */
import { connect } from 'react-redux'
import * as actionCreators from '../redux/actions/index'
import { ThunkDispatch } from 'redux-thunk'
import { AnyAction } from 'redux'

/* Material */
import { CircularProgress, Button } from '@material-ui/core'

/* Ace */
import AceEditor from 'react-ace'
import 'brace/mode/c_cpp'
import 'brace/mode/java'
import 'brace/mode/python'
import 'brace/mode/ruby'
import 'brace/mode/pascal'
import 'brace/mode/haskell'
import 'brace/theme/monokai'

/* Components */
import SubmissionResponseDialog from '../components/tasks/SubmissionResponseDialog'

/* Styles */
import firebase from 'firebase'

interface ISubmissionDetailComponentProps {
  onInitialLoad: (submission_id: string) => void
  detail: any
  match: any
  submit: (
    uid: string,
    problem_id: string,
    code: string,
    language: string
  ) => void
  detailStatus: 'LOADING' | 'SUCCESS' | null
  submissionResponse?: number
}

class SubmissionDetailComponent extends React.Component<
  ISubmissionDetailComponentProps,
  any
> {
  componentDidMount() {
    this.props.onInitialLoad(this.props.match.params.id)
  }

  render() {
    const submitCode = () => {
      const user = firebase.auth().currentUser
      if (!user || user.uid !== this.props.detail.metadata.uid) {
        alert('Unauthorized')
        return
      }
      this.props.submit(
        this.props.detail.metadata.uid,
        this.props.detail.metadata.problem_id,
        (this.refs.aceEditor as any).editor.getValue(),
        this.props.detail.metadata.language
      )
    }
    return this.props.detailStatus === 'LOADING' ? (
      <div id="loading">
        <CircularProgress />
      </div>
    ) : (
      <div>
        <div
        // className={styles.editor}
        >
          <AceEditor
            ref="aceEditor"
            mode={this.props.detail.metadata.language}
            theme="monokai"
            value={this.props.detail.code}
            readOnly={
              !firebase.auth().currentUser ||
              firebase.auth().currentUser!.uid !==
                this.props.detail.metadata.uid
            }
          />
        </div>
        <Button onClick={submitCode}>Submit</Button>
        {this.props.submissionResponse === -1 ? (
          <CircularProgress />
        ) : this.props.submissionResponse ? (
          <SubmissionResponseDialog status={this.props.submissionResponse} />
        ) : null}
      </div>
    )
  }
}

const mapStateToProps: (state: any) => any = state => {
  return {
    detail: state.submissions.detail,
    detailStatus: state.submissions.detailStatus,
    submissionResponse: state.submissions.submissionResponse
  }
}

const mapDispatchToProps: (
  dispatch: ThunkDispatch<{}, {}, AnyAction>
) => any = dispatch => {
  return {
    onInitialLoad: (submission_id: string) => {
      dispatch(actionCreators.loadDetail(submission_id))
    },
    submit: (
      uid: string,
      problem_id: string,
      code: string,
      language: string
    ) => {
      dispatch(actionCreators.makeSubmission(uid, problem_id, code, language))
    }
  }
}

export const SubmissionDetailPage = connect(
  mapStateToProps,
  mapDispatchToProps
)(SubmissionDetailComponent)