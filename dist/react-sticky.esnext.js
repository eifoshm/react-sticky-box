import React from "react";
import ResizeObserver from "resize-observer-polyfill";

const offsetTill = (node, target) => {
  let current = node;
  let offset = 0;
  do {
    offset += current.offsetTop;
    current = current.offsetParent;
  } while (current && current !== target);
  return offset;
};

let stickyProp = null;
if (window.CSS && window.CSS.supports) {
  if (window.CSS.supports("position", "sticky")) stickyProp = "sticky";
  else if (window.CSS.supports("position", "-webkit-sticky")) stickyProp = "-webkit-sticky";
}

class StickyBox extends React.Component {
  constructor(...args) {
    var _temp;

    return (_temp = super(...args)), (this.registerContainerRef = n => {
      if (!stickyProp) return;
      this.node = n;
      if (n) {
        this.prevTimestamp = 0;
        this.scrollPane = window;
        this.latestScrollY = window.scrollY;
        this.scrollPane.addEventListener("scroll", this.throttleScroll);
        window.addEventListener("resize", this.updateViewport);
        this.updateViewport();
        this.ropn = new ResizeObserver(this.updateParentNode);
        this.ropn.observe(this.node.parentNode);
        this.updateParentNode();

        this.ron = new ResizeObserver(this.updateNode);
        this.ron.observe(this.node);
        this.updateNode();

        this.initial();
      } else {
        this.scrollPane.removeEventListener("scroll", this.throttleScroll);
        window.removeEventListener("resize", this.getMeasurements);
        this.ropn.disconnect();
        this.ron.disconnect();
        this.scrollPane = null;
      }
    }), (this.updateViewport = () => {
      this.viewPortHeight = window.innerHeight;
      this.scrollPaneOffset = 0;
    }), (this.updateScrollPane = () => {
      this.viewPortHeight = this.scrollPane.offsetHeight;
      this.scrollPaneOffset = this.scrollPane.getBoundingClientRect().top;
    }), (this.updateParentNode = () => {
      const parentNode = this.node.parentNode;
      const computedParentStyle = getComputedStyle(parentNode, null);
      const parentPaddingTop = parseInt(computedParentStyle.getPropertyValue("padding-top"), 10);
      const parentPaddingBottom = parseInt(
        computedParentStyle.getPropertyValue("padding-bottom"),
        10
      );
      const verticalParentPadding = parentPaddingTop + parentPaddingBottom;
      this.naturalTop =
        offsetTill(parentNode, this.scrollPane) + parentPaddingTop + this.scrollPaneOffset;
      this.parentHeight = parentNode.getBoundingClientRect().height - verticalParentPadding;
    }), (this.updateNode = () => {
      this.nodeHeight = this.node.getBoundingClientRect().height;
    }), (this.throttleScroll = () => {
      const timestamp = +new Date();
      if (timestamp - this.prevTimestamp >= 16) {
        this.handleScroll();
        this.prevTimestamp = timestamp;
      } else {
        console.log("drop!");
      }
    }), (this.handleScroll = () => {
      console.log(this.props.stickyOffset);
      const scrollY = window.scrollY;
      if (scrollY === this.latestScrollY) return;
      if (this.nodeHeight <= this.viewPortHeight) {
        // Just make it sticky if node smaller than viewport
        this.initial();
        return;
      }
      const scrollDelta = scrollY - this.latestScrollY;
      if (scrollDelta > 0) {
        // scroll down
        if (this.mode === "stickyTop") {
          if (scrollY + this.scrollPaneOffset > this.naturalTop) {
            this.mode = "relative";
            this.node.style.position = "relative";
            this.offset = Math.max(0, this.scrollPaneOffset + this.latestScrollY - this.naturalTop);
            this.node.style.top = `${this.offset}px`;
          }
        } else if (this.mode === "relative") {
          if (
            scrollY + this.scrollPaneOffset + this.viewPortHeight >
            this.naturalTop + this.nodeHeight + this.offset
          ) {
            this.mode = "stickyBottom";
            this.node.style.position = stickyProp;
            this.node.style.top = `${this.viewPortHeight - this.nodeHeight}px`;
          }
        }
      } else {
        // scroll up
        if (this.mode === "stickyBottom") {
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
            this.node.style.top = `${this.offset}px`;
          }
        } else if (this.mode === "relative") {
          if (this.scrollPaneOffset + scrollY < this.naturalTop + this.offset) {
            this.mode = "stickyTop";
            this.node.style.position = stickyProp;
            this.node.style.top = 0;
          }
        }
      }

      this.latestScrollY = scrollY;
    }), _temp;
  }

  initial() {
    if (this.mode !== "stickyTop") {
      this.mode = "stickyTop";
      this.node.style.position = stickyProp;
      this.node.style.top = 0;
    }
  }

  shouldComponentUpdate(nextProps) {
    return this.props.children !== nextProps.children;
  }

  render() {
    const {children, className, style} = this.props;
    return React.createElement(
      "div",
      {className: className, style: style, ref: this.registerContainerRef},
      children
    );
  }
}
StickyBox.defaultProps = {
  stickyOffset: 0,
};

export default StickyBox;
