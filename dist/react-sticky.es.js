import _Object$getPrototypeOf from "babel-runtime/core-js/object/get-prototype-of";
import _classCallCheck from "babel-runtime/helpers/classCallCheck";
import _createClass from "babel-runtime/helpers/createClass";
import _possibleConstructorReturn from "babel-runtime/helpers/possibleConstructorReturn";
import _inherits from "babel-runtime/helpers/inherits";
import React from "react";
import ResizeObserver from "resize-observer-polyfill";

var THROTTLE_TIMEOUT = 16;

var offsetTill = function offsetTill(node, target) {
  var current = node;
  var offset = 0;
  do {
    offset += current.offsetTop;
    current = current.offsetParent;
  } while (current && current !== target);
  return offset;
};

var stickyProp = null;
if (window.CSS && window.CSS.supports) {
  if (window.CSS.supports("position", "sticky")) stickyProp = "sticky";
  else if (window.CSS.supports("position", "-webkit-sticky")) stickyProp = "-webkit-sticky";
}

var StickyBox = (function(_React$Component) {
  _inherits(StickyBox, _React$Component);

  function StickyBox() {
    var _ref;

    var _temp, _this, _ret;

    _classCallCheck(this, StickyBox);

    for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }

    return (_ret = (
      (_temp = (
        (_this = _possibleConstructorReturn(
          this,
          (_ref = StickyBox.__proto__ || _Object$getPrototypeOf(StickyBox)).call.apply(
            _ref,
            [this].concat(args)
          )
        )),
        _this
      )),
      (_this.registerContainerRef = function(n) {
        if (!stickyProp) return;
        _this.node = n;
        if (n) {
          _this.prevTimestamp = 0;
          _this.stickyOffset = 0;
          _this.prevStickyOffset = 0;
          _this.prevUpdateFn = function() {};
          _this.scrollPane = window;
          _this.latestScrollY = window.scrollY;
          _this.scrollPane.addEventListener("scroll", _this.throttleScroll);
          window.addEventListener("resize", _this.updateViewport);
          _this.updateViewport();
          _this.ropn = new ResizeObserver(_this.updateParentNode);
          _this.ropn.observe(_this.node.parentNode);
          _this.updateParentNode();

          _this.ron = new ResizeObserver(_this.updateNode);
          _this.ron.observe(_this.node);
          _this.updateNode();

          _this.initial(0);
        } else {
          _this.scrollPane.removeEventListener("scroll", _this.throttleScroll);
          window.removeEventListener("resize", _this.getMeasurements);
          _this.ropn.disconnect();
          _this.ron.disconnect();
          _this.scrollPane = null;
        }
      }),
      (_this.updateViewport = function() {
        _this.viewPortHeight = window.innerHeight;
        _this.scrollPaneOffset = 0;
      }),
      (_this.updateScrollPane = function() {
        _this.viewPortHeight = _this.scrollPane.offsetHeight;
        _this.scrollPaneOffset = _this.scrollPane.getBoundingClientRect().top;
      }),
      (_this.updateParentNode = function() {
        var parentNode = _this.node.parentNode;
        var computedParentStyle = getComputedStyle(parentNode, null);
        var parentPaddingTop = parseInt(computedParentStyle.getPropertyValue("padding-top"), 10);
        var parentPaddingBottom = parseInt(
          computedParentStyle.getPropertyValue("padding-bottom"),
          10
        );
        var verticalParentPadding = parentPaddingTop + parentPaddingBottom;
        _this.naturalTop =
          offsetTill(parentNode, _this.scrollPane) + parentPaddingTop + _this.scrollPaneOffset;
        _this.parentHeight = parentNode.getBoundingClientRect().height - verticalParentPadding;
      }),
      (_this.updateNode = function() {
        _this.nodeHeight = _this.node.getBoundingClientRect().height;
        _this.update();
      }),
      (_this.throttleScroll = function() {
        var timestamp = +new Date();
        if (timestamp - _this.prevTimestamp >= THROTTLE_TIMEOUT) {
          _this.handleScroll();
          _this.prevTimestamp = timestamp;
        }
      }),
      (_this.handleScroll = function() {
        var scrollY = window.scrollY;
        if (_this.nodeHeight <= _this.viewPortHeight - _this.stickyOffset) {
          // Just make it sticky if node smaller than viewport
          _this.initial();
          return;
        }
        var scrollDelta = scrollY - _this.latestScrollY;
        if (scrollDelta > 0) {
          // scroll down
          if (_this.mode === "stickyTop") {
            _this.updateDownStickyTop();
          } else if (_this.mode === "relative") {
            _this.updateDownRelative();
          }
        } else {
          // scroll up
          if (_this.mode === "stickyBottom") {
            _this.updateUpStickyBottom();
          } else if (_this.mode === "relative") {
            _this.updateUpRelative();
          }
        }

        _this.latestScrollY = scrollY;
      }),
      _temp
    )), _possibleConstructorReturn(_this, _ret);
  }

  _createClass(StickyBox, [
    {
      key: "initial",
      value: function initial() {
        if (this.mode !== "stickyTop") {
          this.mode = "stickyTop";
          this.node.style.position = stickyProp;
          this.node.style.top = this.stickyOffset + "px";
        }
      },
    },
    {
      key: "updateDownStickyTop",
      value: function updateDownStickyTop() {
        var scrollY = window.scrollY;
        if (scrollY + this.scrollPaneOffset + this.stickyOffset > this.naturalTop) {
          this.mode = "relative";
          this.node.style.position = "relative";
          this.offset = Math.max(
            0,
            this.scrollPaneOffset + this.latestScrollY + this.stickyOffset - this.naturalTop
          );
          this.node.style.top = this.offset + "px";
        }
        this.prevUpdateFn = this.updateDownStickyTop;
      },
    },
    {
      key: "updateDownRelative",
      value: function updateDownRelative() {
        var scrollY = window.scrollY;
        if (
          scrollY + this.scrollPaneOffset + this.viewPortHeight >
          this.naturalTop + this.nodeHeight + this.offset
        ) {
          this.mode = "stickyBottom";
          this.node.style.position = stickyProp;
          this.node.style.top = this.viewPortHeight - this.nodeHeight + "px";
        }
        this.prevUpdateFn = this.updateDownRelative;
      },
    },
    {
      key: "updateUpStickyBottom",
      value: function updateUpStickyBottom() {
        var scrollY = window.scrollY;
        if (
          this.scrollPaneOffset + scrollY + this.viewPortHeight <
          this.naturalTop + this.parentHeight
        ) {
          this.mode = "relative";
          this.node.style.position = "relative";
          this.offset =
            this.scrollPaneOffset +
            this.latestScrollY +
            this.viewPortHeight -
            (this.naturalTop + this.nodeHeight);
          this.node.style.top = this.offset + "px";
        }
        this.prevUpdateFn = this.updateUpStickyBottom;
      },
    },
    {
      key: "updateUpRelative",
      value: function updateUpRelative() {
        var scrollY = window.scrollY;
        if (this.scrollPaneOffset + scrollY + this.stickyOffset < this.naturalTop + this.offset) {
          this.mode = "stickyTop";
          this.node.style.position = stickyProp;
          this.node.style.top = this.stickyOffset + "px";
        }
        this.prevUpdateFn = this.updateUpRelative;
      },
    },
    {
      key: "removethis",
      value: function removethis() {
        var prevTop = parseInt(this.node.style.top, 10);
        this.node.style.top = prevTop + this.stickyOffset - this.prevStickyOffset + "px";
        this.prevStickyOffset = this.stickyOffset;
      },
    },
    {
      key: "updateStickyOffset",
      value: function updateStickyOffset(stickyOffset) {
        this.stickyOffset = stickyOffset;
        this.prevUpdateFn();
      },
    },
    {
      key: "update",
      value: function update() {
        this.prevUpdateFn();
      },
    },
    {
      key: "shouldComponentUpdate",
      value: function shouldComponentUpdate(nextProps) {
        return this.props.children !== nextProps.children;
      },
    },
    {
      key: "render",
      value: function render() {
        var _props = this.props,
          children = _props.children,
          className = _props.className,
          style = _props.style;

        return React.createElement(
          "div",
          {className: className, style: style, ref: this.registerContainerRef},
          children
        );
      },
    },
  ]);

  return StickyBox;
})(React.Component);

export default StickyBox;
