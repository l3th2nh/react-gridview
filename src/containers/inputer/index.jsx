import React from "react";
import OperationModel from "../../model/operation";
import GridViewModel from "../../model/gridview";

import {createInputStyle} from "./create-style";
import {inputKeyDown} from "./key-behavior";

const Inputer = React.createClass({
  displayName: "Gridview-Cells",
  propTypes: {
    value: React.PropTypes.string,
    viewModel: React.PropTypes.instanceOf(GridViewModel),
    opeModel: React.PropTypes.instanceOf(OperationModel),
    onValueChange: React.PropTypes.func,
    onStateChange: React.PropTypes.func
  },
  getInitialState() {
    return {
      inputText: ""
    };
  },
  componentDidMount(){
    this.refs.inputText.getDOMNode().onkeydown  = this._onKeyDown;
  },
  componentDidUpdate(prevProps, prevState){
    //this.refs.inputText.getDOMNode().focus();
  },
  componentWillReceiveProps(nextProps){
    const prevInput = this.props.opeModel.input;

    // 入力中　→　入力解除の場合は、変更値をセルに反映させる。
    if ((prevInput.isInputing === true) &&
        (nextProps.opeModel.input.isInputing === false)){
      nextProps.onValueChange(prevInput.target, this.state.inputText);
    }

    // 入力解除　→　入力の場合は、セルの値を削除する
    if ((prevInput.isInputing === false) &&
        (nextProps.opeModel.input.isInputing === true)){
      this.setState({inputText: ""});
    }

  },
  setInputFocus(){
    this.refs.inputText.getDOMNode().focus();
  },
  _onKeyDown(e){
    return inputKeyDown(e, this.props);
  },
  changeText(e) {
    this.setState({inputText: e.target.value});
  },
  _onBlur(){
    const input = this.props.opeModel.input.setIsInputing(false);
    const ope = this.props.opeModel.setInput(input);
    this.props.onStateChange(this.props.viewModel, ope);
  },
  render() {
    const style = createInputStyle(this.props.opeModel);
    //const value = this._getValue();
    const value = this.state.inputText;

    return (
      <input style={style} type="text" ref="inputText" value={value}
        onChange={this.changeText} onBlur={this._onBlur} />
    );
  }
});

module.exports = Inputer;
