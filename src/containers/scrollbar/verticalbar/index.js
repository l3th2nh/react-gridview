//
// 縦のスクロールバー
//

import React from "react";
import ReactDOM from "react-dom";

import OperationModel from "../../../model/operation";
import GridViewModel  from "../../../model/sheet";

// モデル
//import {Point, Rect} from "../../../model/common";

// ライブラリ
import {drag} from "../../../util/drag";

// スタイルシート読み込み
import "./css.js";

const PADDING = 0;

// thumbの最小高さ
const THUMB_MIN_HEIGHT = 30;

const Verticalbar  = React.createClass({
  displayName: "Verticalbar",
  propTypes: {
    className: React.PropTypes.string,
    opeModel: React.PropTypes.instanceOf(OperationModel),
    viewModel: React.PropTypes.instanceOf(GridViewModel),
    smallChange: React.PropTypes.number,
    largeChange: React.PropTypes.number,
    value: React.PropTypes.number,
    onChangeValue: React.PropTypes.func
  },
  getDefaultProps() {
    return {
      smallChange: 1,
      largeChange: 5,
      onChangeValue: ()=>{}
    };
  },
  getInitialState() {
    return {
      thumbAreaRect: null,
      offsetY: 0
    };
  },
  _handleResize(){
    const thumbArea = ReactDOM.findDOMNode(this.refs.rgThumbArea);
    const areaRect = thumbArea.getBoundingClientRect();
    this.setState({thumbAreaRect: areaRect});
  },
  componentDidMount(){
    const node = ReactDOM.findDOMNode(this.refs.rgThumb);
    drag(node, this._dragStart, this._dragMove);
    window.addEventListener('resize', this._handleResize);
    this._handleResize();
  },
  componentWillUnmount() {
    window.removeEventListener('resize', this._handleResize);
  },
  // スタイルの生成
  _createStyle(){
    let style = {
      position: "absolute"
    };

    style.top = "0px";
    style.right = "0px";
    style.height = "100%";
    style.overflowX = "hidden";
    style.overflowY = "hidden";
    return style;
  },
  _dragStart(e){
    if (!this.state.thumbAreaRect){
      return;
    }
    this.setState({offsetY: e.offsetY});
  },
  _getScrollMaxValue(){
    const viewModel = this.props.viewModel;
    const opeModel = this.props.opeModel;
    if ((!viewModel) || (!opeModel)) {
      return 0;
    }

    const canvasRect = opeModel.canvasRect;
    if (!canvasRect){
      return 0;
    }
    const tableHeight = canvasRect.height - viewModel.columnHeader.height;
    let sumHeight = 0;
    let rowNo = 1;
    viewModel.rowHeader.items.reverse().forEach((item, key)=>{
      sumHeight = sumHeight + item.height;

      if (sumHeight > tableHeight){
        return false;
      }
      rowNo = key;
    });

    return rowNo;
  },
  // thumbバーを操作中の処理
  _dragMove(e){
    if (!this.state.thumbAreaRect){
      return;
    }

    const nextTop = (e.clientY - this.state.thumbAreaRect.top - this.state.offsetY);

    const view = this.props.viewModel;
    const scrollMax = this._getScrollMaxValue();

    // 移動可能領域の幅
    const moveAreaHeight = this.state.thumbAreaRect.height - this._thumHeight();
    const fullHeight = view.rowHeader.items.get(scrollMax).bottom;

    // １ピクセルあたりの倍率を求める
    const magnification = fullHeight / moveAreaHeight;
    // スクロールバー位置に対応するcanvas上のX座標を求める
    const canvasY = nextTop * magnification + 18;

    let rowNo = this.props.viewModel.pointToRowNo(canvasY);
    let maxNo = this._getScrollMaxValue();

    if (!rowNo){
      rowNo = (nextTop < PADDING) ?
        1 :
        maxNo;
    }

    if (rowNo > maxNo){
      rowNo = maxNo;
    }

    this.props.onChangeValue(rowNo);
  },
  // thumbの幅
  _thumHeight(){
    if(!this.state.thumbAreaRect){
      return THUMB_MIN_HEIGHT;
    }
    const areaHeight = this.state.thumbAreaRect.height;
    const fullHeight = this.props.viewModel.rowHeader.height;

    const magnification = fullHeight / areaHeight;
    const thumbHeight = areaHeight / magnification;

    if (thumbHeight < THUMB_MIN_HEIGHT) {
      return THUMB_MIN_HEIGHT;
    }

    return thumbHeight;
  },
  // thumbの左側の位置
  _thumTop(){
    if(!this.state.thumbAreaRect){
      return PADDING;
    }
    const view = this.props.viewModel;
    const scrollMax = this._getScrollMaxValue();

    const thumbHeight = this._thumHeight();
    // 移動可能領域の幅
    const moveAreaHeight = this.state.thumbAreaRect.height - thumbHeight;
    const fullHeight = view.rowHeader.items.get(scrollMax).bottom - view.columnHeader.height;

    // １ピクセルあたりの倍率を求める
    const magnification = fullHeight / moveAreaHeight;
    const scrollNo = this.props.opeModel.scroll.rowNo;
    const scrollCell = view.rowHeader.items.get(scrollNo);

    if (!scrollCell){
      return PADDING;
    }

    const top = Math.round((scrollCell.top  - view.columnHeader.height) / magnification);
    return top;
  },
  _onMouseDown(e){
    const thumbArea = ReactDOM.findDOMNode(this.refs.rgThumb);
    const areaRect = thumbArea.getBoundingClientRect();

    if (areaRect.bottom < e.clientY){
      const value = this.props.value + this.props.largeChange;
      this.props.onChangeValue(Math.min(value, this._getScrollMaxValue()));
    }

    if (areaRect.top > e.clientY){
      const value = this.props.value - this.props.largeChange;
      this.props.onChangeValue(Math.max(value, 1));
    }
  },
  render() {
    const style = this._createStyle();
    let thumbStyle = {
      left: "0",
      top: this._thumTop() + "px",
      height: this._thumHeight() + "px",
      width: "calc(20px - 6px)"
    };
    return (
      <div className="rg-scroll-vertical-base" style={style}>
        <div className="rg-scroll-vertical-thumb-area" ref="rgThumbArea" onMouseDown={this._onMouseDown}>
          <div className="rg-scroll-vertical-thumb" ref="rgThumb" style={thumbStyle}></div>
        </div>
      </div>
    );
  }
});

export {
  Verticalbar
};
