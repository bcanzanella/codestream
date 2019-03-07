import React, { Component } from "react";
import Button from "./Button";
import { HostApi } from "../webview-api";
import { CompareMarkerRequestType, ApplyMarkerRequestType } from "../ipc/webview.protocol";

export default class PostDetails extends Component {
	handleClickShowDiff = event => {
		event.preventDefault();
		HostApi.instance.send(CompareMarkerRequestType, { marker: this.props.codemark.markers[0] });
	};

	handleClickApplyPatch = event => {
		event.preventDefault();
		HostApi.instance.send(ApplyMarkerRequestType, { marker: this.props.codemark.markers[0] });
	};

	render() {
		const { codemark } = this.props;

		if (!codemark) return null;

		const hasCodeBlock = codemark.markers && codemark.markers.length ? true : null;
		let canCompare = hasCodeBlock && this.props.capabilities.codemarkCompare;
		let canApply = hasCodeBlock && this.props.capabilities.codemarkApply;

		let commitDiv = null;
		if (hasCodeBlock) {
			commitDiv = (
				<div className="posted-to">
					<label>Posted to:</label> <span>{codemark.markers[0].commitHashWhenCreated}</span>
				</div>
			);
		}

		return (
			<div className="post-details" id={codemark.id} ref={ref => (this._div = ref)}>
				{alert}
				{commitDiv}
				{(canCompare || canApply) && (
					<div className="button-group">
						{canCompare && (
							<Button
								id="compare-button"
								className="control-button"
								tabIndex="2"
								type="submit"
								loading={this.props.loading}
								onClick={this.handleClickShowDiff}
							>
								Compare
							</Button>
						)}
						{canApply && (
							<Button
								id="apply-button"
								className="control-button"
								tabIndex="3"
								type="submit"
								loading={this.props.loading}
								onClick={this.handleClickApplyPatch}
							>
								Apply
							</Button>
						)}
					</div>
				)}
			</div>
		);
	}
}
