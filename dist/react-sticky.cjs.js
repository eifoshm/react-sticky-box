

function _interopDefault(ex) {
  return ex && typeof ex === "object" && "default" in ex ? ex["default"] : ex;
}

var _Object$getPrototypeOf = _interopDefault(
  require("babel-runtime/core-js/object/get-prototype-of")
);
var _classCallCheck = _interopDefault(require("babel-runtime/helpers/classCallCheck"));
var _createClass = _interopDefault(require("babel-runtime/helpers/createClass"));
var _possibleConstructorReturn = _interopDefault(
  require("babel-runtime/helpers/possibleConstructorReturn")
);
var _inherits = _interopDefault(require("babel-runtime/helpers/inherits"));
var React = _interopDefault(require("react"));
var ResizeObserver = _interopDefault(require("resize-observer-polyfill"));

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

          _this.initial();
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
      }),
      (_this.throttleScroll = function() {
        var timestamp = +new Date();
        if (timestamp - _this.prevTimestamp >= 32) {
          _this.handleScroll();
          _this.prevTimestamp = timestamp;
        }
      }),
      (_this.handleScroll = function() {
        var scrollY = window.scrollY;
        if (scrollY === _this.latestScrollY) return;
        if (_this.nodeHeight <= _this.viewPortHeight) {
          // Just make it sticky if node smaller than viewport
          _this.initial();
          return;
        }
        var scrollDelta = scrollY - _this.latestScrollY;
        if (scrollDelta > 0) {
          // scroll down
          if (_this.mode === "stickyTop") {
            if (scrollY + _this.scrollPaneOffset > _this.naturalTop) {
              _this.mode = "relative";
              _this.node.style.position = "relative";
              _this.offset = Math.max(
                0,
                _this.scrollPaneOffset + _this.latestScrollY - _this.naturalTop
              );
              _this.node.style.top = _this.offset + "px";
            }
          } else if (_this.mode === "relative") {
            if (
              scrollY + _this.scrollPaneOffset + _this.viewPortHeight >
              _this.naturalTop + _this.nodeHeight + _this.offset
            ) {
              _this.mode = "stickyBottom";
              _this.node.style.position = stickyProp;
              _this.node.style.top = _this.viewPortHeight - _this.nodeHeight + "px";
            }
          }
        } else {
          // scroll up
          if (_this.mode === "stickyBottom") {
            if (
              _this.scrollPaneOffset + scrollY + _this.viewPortHeight <
              _this.naturalTop + _this.parentHeight
            ) {
              _this.mode = "relative";
              _this.node.style.position = "relative";
              _this.offset =
                _this.scrollPaneOffset +
                _this.latestScrollY +
                _this.viewPortHeight -
                (_this.naturalTop + _this.nodeHeight);
              _this.node.style.top = _this.offset + "px";
            }
          } else if (_this.mode === "relative") {
            if (_this.scrollPaneOffset + scrollY < _this.naturalTop + _this.offset) {
              _this.mode = "stickyTop";
              _this.node.style.position = stickyProp;
              _this.node.style.top = 0;
            }
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
        var bottom = this.props.bottom;

        if (bottom) {
          if (this.mode !== "stickyBottom") {
            this.mode = "stickyBottom";
            this.node.style.position = stickyProp;
            this.node.style.top = this.viewPortHeight - this.nodeHeight + "px";
          }
        } else {
          if (this.mode !== "stickyTop") {
            this.mode = "stickyTop";
            this.node.style.position = stickyProp;
            this.node.style.top = 0;
          }
        }
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

module.exports = StickyBox;
