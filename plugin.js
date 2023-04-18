#!/usr/bin/env node
import { sendJsonRpcMessage } from "./rpc.js";
import { log } from "./log.js";
import path from "path";

class Plugin {
  constructor(options) {
		this.dynamic = options.dynamic || false;
		this.options = []
		this.methods = []
	}

	addOption = (key, type, description, default_value) => {
		this.options.push({
			name: key,
			type: type,
			description: description,
			default: default_value,
		})
	}

	addMethod = (key, description, usage) => {
		this.methods.push({
			name: key,
			description: description,
			usage: usage,
		})
	}

  init = {};

  // Options

  test = "";
  cli_params = {};
  rpc_path = "";

  manifest = () => {
    return {
      dynamic: true,
      options: this.options,
      rpcmethods: this.methods
    }
  }

  testinfo = () => {
    return {
      node_id:
        "029999ce6a1b74cf077f503b81bb4d95af34114363bdac5922a9b353ce0449bac4",
      option: {
        test: this.test,
      },
      cli_params: this.cli_params,
      rpc_path: this.rpc_path,
    };
  };

  mainLoop = async () => {
    let chunk;
    let message;

    while ((chunk = process.stdin.read())) {
      const msg = chunk.split("\n\n")[0];
      try {
        message = JSON.parse(msg);
      } catch (err) {
        console.error("Error parsing JSON:", err);
      }
      if (!message || !message.method || message.jsonrpc !== "2.0") {
        console.error("Invalid JSON-RPC 2.0 message:", line);
      } else {
        await this.handleMessage(message);
      }
    }
  };

  handleMessage = async (message) => {
    log(JSON.stringify(message));
    const id = message.id;
    const method = message.method;
    switch (method) {
      case "getmanifest":
        this.sendResponse(id, this.manifest());
        break;
      case "init":
        this.test = message.params.options.test;
        const config = message.params.configuration;
        this.rpc_path = path.join(config["lightning-dir"], config["rpc-file"]);
        this.sendResponse(id, this.init);
        break;
      case "testinfo":
        const info = await sendJsonRpcMessage(this.rpc_path, "getinfo", {});
        this.cli_params = message.params;
        this.sendResponse(id, info);
      case "getchannels":
        const channels = await sendJsonRpcMessage(
          this.rpc_path,
          "listchannels",
          {}
        );
        this.sendResponse(id, channels);
    }
  };

  sendResponse = (id, result) => {
    const response = {
      jsonrpc: "2.0",
      id: id,
      result: result,
    };
    log(JSON.stringify(response));
    process.stdout.write(JSON.stringify(response) + "\n\n");
  };

  start = () => {
    process.stdin.setEncoding("utf8");
    process.stdin.on("readable", async () => {
      await this.mainLoop();
    });
  };
}

export { Plugin };
