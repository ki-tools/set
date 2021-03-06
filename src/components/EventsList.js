import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { motion, AnimatePresence, AnimateSharedLayout } from 'framer-motion';
import Event from './Event';
import ExpandInfo from './ExpandInfo';
import { pinnedLabWidths, getPinnedTextFromData } from '../utils/pinnedText';

const EventsList = ({
  data, gid, pinned, collapsed, setRangeStats, xScaleFoc, windowSize, expanded
}) => {
  // get positions of elements that should be visible
  const rows = [[]];
  const rowEnds = [0];
  const rowPad = 22;
  const focWidth = windowSize.appWidth;
  // compute data structure containing layout information
  const expandedRows = expanded.map((d) => d.row);

  const variants = {
    enter: {
      height: 'auto',
      opacity: 1,
      transition: {
        height: { duration: 0.2 },
        opacity: { duration: 0.4, delay: 0 }
      }
    },
    exit: {
      height: 0,
      opacity: 0,
      transition: {
        height: { duration: 0.2, delay: 0.1 },
        opacity: { duration: 0.4 }
      }
    }
  };

  const rowVariants = {
    enter: { opacity: 1, transition: { duration: 1 } },
    exit: { opacity: 0, transition: { duration: 1 } }
  };

  if (data.length === 0) {
    return (<div />);
  }

  let beforeRange = 0;
  let inRange = 0;
  let afterRange = 0;

  data.forEach((d) => {
    let extraWidth = 0; // for pinned items
    if (pinned) {
      extraWidth = pinnedLabWidths[getPinnedTextFromData(d)];
      if (extraWidth === undefined) {
        extraWidth = 0;
      }
    }
    const xStart = xScaleFoc(d.age_start / 7);
    const xEnd = xScaleFoc(d.age_end / 7);
    const eventWidth = Math.max(xEnd - xStart, 20);
    // const eventWidth = Math.max(xEnd - xStart, 5); // when using svg
    let eventPeakWidth = eventWidth;
    let eventPeakStart = xStart;
    if (d.age_start_peak && d.age_end_peak) {
      eventPeakStart = xScaleFoc(d.age_start_peak / 7);
      eventPeakWidth = xScaleFoc(d.age_end_peak / 7) - eventPeakStart;
    }
    if (xStart + eventWidth < 0) {
      beforeRange += 1;
    }
    if (xStart > focWidth) {
      afterRange += 1;
    }
    const outOfRange = xStart + eventWidth < 0 || xStart > focWidth;
    if (!outOfRange) {
      inRange += 1;
      let curWidth = Math.max(d.textWidth + extraWidth, eventWidth) + rowPad;
      let xStart2 = xStart;
      // we still want the full text to show if the event is on the left edge of the timeline
      let paddingLeft = 5;
      if (xStart < 0) {
        paddingLeft = -xStart + 5;
        curWidth = Math.max(d.textWidth + extraWidth, xEnd - xStart);
        xStart2 = 0;
      }
      // see if any existing row is narrow enough to fit a new element
      let foundSpot = false;
      const newDat = Object.assign(d, {
        xStart,
        extraWidth,
        eventWidth,
        eventPeakStart,
        eventPeakWidth,
        paddingLeft
      });

      // const newDat = Object.assign({}, d);
      // newDat.xStart = xStart;
      // newDat.eventWidth = eventWidth;
      // newDat.paddingLeft = paddingLeft;

      for (let ii = 0; ii < rowEnds.length; ii += 1) {
        const rw = rowEnds[ii];
        // if we are on an empty row or the element fits on this row, we add the element
        // and the end of the row becomes the starting point plus the width of the element
        if (rw === 0 || (rw < xStart2 && rw + curWidth < focWidth)) {
          rows[ii].push(newDat);
          rowEnds[ii] = xStart2 + curWidth;
          foundSpot = true;
          break;
        }
      }
      if (!foundSpot) {
        rows.push([newDat]);
        rowEnds.push(xStart2 + curWidth);
      }
    }
  });

  setRangeStats({ before: beforeRange, in: inRange, after: afterRange });

  if (collapsed) {
    return ('');
  }

  return (
    <AnimateSharedLayout>
      {
        rows.map((rowdat, i) => {
          const rowId = `${gid}-${i}`;
          const idx = expandedRows.indexOf(rowId);
          return (
            <motion.div
              variants={rowVariants}
              key={rowId}
              layoutID={rowId}
              style={{ overflow: 'hidden' }}
              // initial="enter"
              animate="enter"
              exit="exit"
              layout
            >
              <div className="event-row">
                <div className="event-row-abs">
                  {
                    rowdat.map((d) => (
                      <Event
                        data={{ ...d, row: rowId }}
                        expanded={idx > -1 && d.uid === expanded[idx].uid}
                        pinned={pinned}
                        key={d.uid}
                      />
                    ))
                  }
                </div>
              </div>
              <AnimatePresence>
                { idx > -1 && (
                  <motion.div
                    key={idx}
                    style={{ overflow: 'hidden', height: 0, opacity: 0 }}
                    intial={{ height: 0, opacity: 0 }}
                    animate="enter"
                    exit="exit"
                    variants={variants}
                  >
                    <ExpandInfo data={expanded[idx]} />
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          );
        })
      }
    </AnimateSharedLayout>
  );
};

EventsList.propTypes = {
  data: PropTypes.array.isRequired,
  gid: PropTypes.string.isRequired,
  pinned: PropTypes.bool.isRequired,
  collapsed: PropTypes.bool.isRequired,
  setRangeStats: PropTypes.func.isRequired,
  xScaleFoc: PropTypes.func.isRequired,
  windowSize: PropTypes.object.isRequired,
  expanded: PropTypes.array.isRequired
};

const mapStateToProps = (state) => ({
  xScaleFoc: state.timelineFocusScale,
  windowSize: state.windowSize,
  expanded: state.expanded
});

export default connect(
  mapStateToProps
)(EventsList);
