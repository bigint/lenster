import { GridLayout } from "@hey/ui";
import { GridItemTwelve } from "@hey/ui/src/GridLayout";
import type { NextPage } from "next";
import AlertDesign from "./AlertDesign";
import BadgeDesign from "./BadgeDesign";
import ButtonsDesign from "./ButtonsDesign";
import CardDesign from "./CardDesign";
import EmptyStateDesign from "./EmptyStateDesign";
import ErrorMessageDesign from "./ErrorMessageDesign";
import ModalDesign from "./ModalDesign";
import ProfilesDesign from "./ProfilesDesign";
import SpinnerDesign from "./SpinnerDesign";
import ToggleDesign from "./ToggleDesign";
import TooltipDesign from "./TooltipDesign";
import TypographyDesign from "./TypographyDesign";

const Design: NextPage = () => {
  return (
    <GridLayout>
      <GridItemTwelve className="space-y-5">
        <TypographyDesign />
        <ButtonsDesign />
        <AlertDesign />
        <ModalDesign />
        <TooltipDesign />
        <ToggleDesign />
        <SpinnerDesign />
        <BadgeDesign />
        <CardDesign />
        <EmptyStateDesign />
        <ErrorMessageDesign />
        <ProfilesDesign />
      </GridItemTwelve>
    </GridLayout>
  );
};

export default Design;
