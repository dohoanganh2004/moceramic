import React from "react";
import { TransitionGroup, CSSTransition } from "react-transition-group";

class SlideChild extends React.Component {
  constructor(props) {
    super(props);
    this.nodeRef = React.createRef();
  }

  render() {
    const { children, timeout, ...rest } = this.props;
    return (
      <CSSTransition {...rest} timeout={timeout} nodeRef={this.nodeRef} classNames="slide">
        <div ref={this.nodeRef} className="page-slide-wrap">
          {children}
        </div>
      </CSSTransition>
    );
  }
}

const PageTransition = ({ routeKey, timeout = 260, children }) => (
  <TransitionGroup component={null}>
    <SlideChild key={routeKey} timeout={timeout}>
      {children}
    </SlideChild>
  </TransitionGroup>
);

export default PageTransition;
