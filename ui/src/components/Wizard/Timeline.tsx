import React from "react";
import { Step } from ".";
import {
  Timeline as MUITimeline,
  TimelineItem,
  TimelineContent,
  TimelineConnector,
  TimelineDot,
  TimelineSeparator,
} from "@mui/lab";
import { Typography } from "@mui/material";

import styles from "./timeline.module.scss";

const lightGrey = "rgb(134, 142, 150)";

interface TimelineProps {
  currentStep: number;
  steps: Step[];
}

export const Timeline: React.FC<TimelineProps> = ({ currentStep, steps }) => {
  return (
    <MUITimeline classes={{ root: styles.root }}>
      {steps.map((step, index) => {
        return (
          <TimelineItem key={step.label} classes={{ root: styles.item }}>
            <TimelineSeparator>
              {index === 0 && <span className={styles.spacer} />}
              <TimelineDot
                classes={{ root: styles.dot }}
                color={index <= currentStep ? "primary" : "grey"}
                variant={index < currentStep ? "filled" : "outlined"}
              />
              {index !== steps.length - 1 && <TimelineConnector />}
            </TimelineSeparator>
            <TimelineContent>
              <div className={styles.content}>
                <Typography
                  variant="h6"
                  className={styles.label}
                  color={index === currentStep ? "primary" : lightGrey}
                >
                  {step.label}
                </Typography>
                <Typography
                  variant="body2"
                  className={styles.description}
                  color={lightGrey}
                >
                  {step.description}
                </Typography>
              </div>
            </TimelineContent>
          </TimelineItem>
        );
      })}
    </MUITimeline>
  );
};
