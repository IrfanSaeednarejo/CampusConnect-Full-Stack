import React from "react";
import PropTypes from "prop-types";
import Avatar from "../common/Avatar";
import Button from "../common/Button";

/**
 * SocietyDetailsPanel
 * Details panel for a selected society submission
 */
const SocietyDetailsPanel = ({ active, onApprove, onReject }) => (
  <div className="flex flex-col p-8 gap-6 flex-1">
    <div className="flex items-center gap-4">
      <div
        className="bg-center bg-no-repeat aspect-square bg-cover rounded-lg size-20"
        data-alt={`${active?.name} Logo`}
        style={{
          backgroundImage: active?.logo ? `url('${active.logo}')` : undefined,
        }}
      ></div>
      <div>
        <h2 className="text-white text-3xl font-bold">{active?.name}</h2>
        <span className="inline-block mt-2 px-3 py-1 text-xs font-semibold text-primary-alt bg-primary-alt/20 rounded-full">
          {active?.category || "Academic"}
        </span>
      </div>
    </div>
    <div className="space-y-2">
      <h4 className="text-[#9db8a8] text-sm font-semibold uppercase tracking-wider">
        Description
      </h4>
      <p className="text-white/90 text-base leading-relaxed">
        {active?.description || "Description not provided."}
      </p>
    </div>
    <div className="space-y-2">
      <h4 className="text-[#9db8a8] text-sm font-semibold uppercase tracking-wider">
        Proposer Details
      </h4>
      <div className="flex items-center gap-3">
        <Avatar
          src={active?.proposerAvatar}
          alt={`Profile picture of ${active?.proposer}`}
          name={active?.proposer}
          size="md"
        />
        <div>
          <p className="text-white font-medium">{active?.proposer}</p>
          <Button
            variant="link"
            size="sm"
            className="text-primary-alt/80 hover:text-primary-alt text-sm"
          >
            View Profile
          </Button>
        </div>
      </div>
    </div>
    <div className="flex justify-end items-center gap-4 border-t border-border-admin bg-card-admin/50 pt-6 mt-6">
      <Button
        variant="danger"
        size="md"
        className="px-6 py-2.5 rounded-lg text-white font-semibold bg-[#DA3633]/20 hover:bg-[#DA3633]/30 border border-red-500/30 hover:border-red-500/50"
        onClick={onReject}
      >
        Reject
      </Button>
      <Button
        variant="success"
        size="md"
        className="px-6 py-2.5 rounded-lg text-black font-semibold bg-primary-alt hover:bg-primary-alt/90"
        onClick={onApprove}
      >
        Approve Society
      </Button>
    </div>
  </div>
);

SocietyDetailsPanel.propTypes = {
  active: PropTypes.object,
  onApprove: PropTypes.func,
  onReject: PropTypes.func,
};

export default SocietyDetailsPanel;
