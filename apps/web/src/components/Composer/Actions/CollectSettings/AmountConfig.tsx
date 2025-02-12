import ToggleWithHelper from "@components/Shared/ToggleWithHelper";
import { CurrencyDollarIcon } from "@heroicons/react/24/outline";
import { DEFAULT_COLLECT_TOKEN, STATIC_IMAGES_URL } from "@hey/data/constants";
import type { CollectModuleType } from "@hey/types/hey";
import { Input, Select } from "@hey/ui";
import type { FC } from "react";
import { useCollectModuleStore } from "src/store/non-persisted/post/useCollectModuleStore";
import { useAccountStore } from "src/store/persisted/useAccountStore";
import { useAllowedTokensStore } from "src/store/persisted/useAllowedTokensStore";

interface AmountConfigProps {
  setCollectType: (data: CollectModuleType) => void;
}

const AmountConfig: FC<AmountConfigProps> = ({ setCollectType }) => {
  const { currentAccount } = useAccountStore();
  const { collectModule } = useCollectModuleStore((state) => state);
  const { allowedTokens } = useAllowedTokensStore();

  const enabled = Boolean(collectModule.amount?.value);

  return (
    <div>
      <ToggleWithHelper
        description="Get paid whenever someone collects your post"
        heading="Charge for collecting"
        icon={<CurrencyDollarIcon className="size-5" />}
        on={enabled}
        setOn={() => {
          setCollectType({
            amount: enabled
              ? null
              : { currency: DEFAULT_COLLECT_TOKEN, value: "1" },
            recipients: enabled
              ? undefined
              : [{ address: currentAccount?.owner, percent: 100 }]
          });
        }}
      />
      {collectModule.amount?.value ? (
        <div className="mt-4 ml-8">
          <div className="flex space-x-2 text-sm">
            <Input
              label="Price"
              max="100000"
              min="0"
              onChange={(event) => {
                setCollectType({
                  amount: {
                    currency: collectModule.amount?.currency,
                    value: event.target.value ? event.target.value : "0"
                  }
                });
              }}
              placeholder="0.5"
              type="number"
              value={Number.parseFloat(collectModule.amount.value)}
            />
            <div className="w-5/6">
              <div className="label">Select currency</div>
              <Select
                iconClassName="size-4"
                onChange={(value) => {
                  setCollectType({
                    amount: {
                      currency: value,
                      value: collectModule.amount?.value as string
                    }
                  });
                }}
                options={allowedTokens?.map((token) => ({
                  icon: `${STATIC_IMAGES_URL}/tokens/${token.symbol}.svg`,
                  label: token.name,
                  selected:
                    token.contractAddress === collectModule.amount?.currency,
                  value: token.contractAddress
                }))}
              />
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
};

export default AmountConfig;
