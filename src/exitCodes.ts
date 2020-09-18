export const exitCodes: {
  [k: number]: ExitCode;
} = {
  0: {
    msg: "Everything went well and the migration was successful.",
    ns: "copybara",
    type: "success",
  },
  1: {
    msg: "Error parsing the command line. Check the logs for details.",
    ns: "copybara",
    type: "error",
  },
  2: {
    msg:
      "Error in the configuration, flags values or in general an error attributable to the user. Check the logs for details.",
    ns: "copybara",
    type: "error",
  },
  3: {
    msg: "Error during repository manipulation. Check the logs for details.",
    ns: "copybara",
    type: "error",
  },
  4: {
    msg: "Execution resulted in no-op, which means that no changes were made in the destination.",
    ns: "copybara",
    type: "warning",
  },
  8: {
    msg: "Execution was interrupted. Check the logs for details.",
    ns: "copybara",
    type: "error",
  },
  30: {
    msg: "Error accessing the network, filesystem errors, etc. Check the logs for details.",
    ns: "copybara",
    type: "error",
  },
  31: {
    msg: "Unexpected error. This would be a Copybara bug. Check the logs for details.",
    ns: "copybara",
    type: "error",
  },
  50: {
    msg: "Action completed successfully.",
    ns: "action",
    type: "success",
  },
  51: {
    msg: "Error with an input variable. Check the logs for details.",
    ns: "action",
    type: "error",
  },
  52: {
    msg: "Unexpected error running Copybara. Please open an issue on olivr/copybara-action.",
    ns: "action",
    type: "error",
  },
  53: {
    msg: "Unexpected error. Please open an issue on olivr/copybara-action.",
    ns: "action",
    type: "error",
  },
  54: {
    msg: "Nothing to do.",
    ns: "action",
    type: "warning",
  },
};

type ExitCode = {
  type: "success" | "warning" | "error";
  ns: "copybara" | "action";
  msg: string;
};
