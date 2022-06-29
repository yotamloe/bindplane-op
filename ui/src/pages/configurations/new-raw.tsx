import React from "react";
import { useNavigate } from "react-router-dom";
import { RawConfigWizard } from "./wizards/RawConfigWizard";

export const NewRawConfigurationPage: React.FC = () => {
  const navigate = useNavigate();

  return <RawConfigWizard onSuccess={() => navigate("/configurations")} />;
};
