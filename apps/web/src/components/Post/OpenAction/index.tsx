import { ShoppingBagIcon } from "@heroicons/react/24/outline";
import allowedCollectActionModules from "@hey/helpers/allowedCollectActionModules";
import humanize from "@hey/helpers/humanize";
import nFormatter from "@hey/helpers/nFormatter";
import type { Post } from "@hey/indexer";
import { Modal, Tooltip } from "@hey/ui";
import plur from "plur";
import { type FC, useState } from "react";
import CollectModule from "./CollectModule";

interface OpenActionProps {
  post: Post;
}

const OpenAction: FC<OpenActionProps> = ({ post }) => {
  const [showCollectModal, setShowCollectModal] = useState(false);
  const { countOpenActions } = post.stats;
  const postActions = post.actions.filter((action) =>
    allowedCollectActionModules.includes(action.__typename || "")
  );

  return (
    <div className="ld-text-gray-500 flex items-center space-x-1">
      <button
        aria-label="Collect"
        className="rounded-full p-1.5 outline-offset-2 hover:bg-gray-300/20"
        onClick={() => setShowCollectModal(true)}
        type="button"
      >
        <Tooltip
          content={`${humanize(countOpenActions)} ${plur(
            "Collect",
            countOpenActions
          )}`}
          placement="top"
          withDelay
        >
          <ShoppingBagIcon className="w-[15px] sm:w-[18px]" />
        </Tooltip>
      </button>
      {countOpenActions > 0 ? (
        <span className="text-[11px] sm:text-xs">
          {nFormatter(countOpenActions)}
        </span>
      ) : null}
      <Modal
        onClose={() => setShowCollectModal(false)}
        show={showCollectModal}
        title="Collect"
      >
        {postActions?.map((action) => (
          <CollectModule
            key={action.__typename}
            postAction={action}
            post={post}
          />
        ))}
      </Modal>
    </div>
  );
};

export default OpenAction;
