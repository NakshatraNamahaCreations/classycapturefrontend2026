import React, { useState } from "react";
import Services from "./Master/Services";
import Category from "./Master/Category";
import PresetQuotation from "./Master/PresetQuotation";
import Complementary from "./Master/Complementary";
import Reference from "./Master/Reference";
import AdditionalServices from "./Master/AdditionalServices";

const Master = () => {
  const [activeTab, setActiveTab] = useState("category");

  const renderContent = () => {
    switch (activeTab) {
      case "services":
        return <Services />;
      case "presetquote":
        return <PresetQuotation />;
      // case "addComplementary":
      //   return <Complementary />;
      case "addReferenceFrom":
        return <Reference />;
      case "addAdditionalServices":
        return <AdditionalServices />;
      default:
        return <Category />;
    }
  };

  return (
    <div className="container py-2 rounded " style={{ background: "#F4F4F4" }}>
      <div className="d-flex gap-3 mb-4">
        <button
          className={`btn rounded-1 shadow-sm  w-25 ${activeTab === "category" ? "btn-dark" : "btn-white"}`}
          onClick={() => setActiveTab("category")}
          style={{ fontSize: "12px" }}
        >
          Category
        </button>
        <button
          className={`btn rounded-1 shadow-sm  w-25 ${activeTab === "services" ? "btn-dark" : "btn-white"}`}
          onClick={() => setActiveTab("services")}
          style={{ fontSize: "12px" }}
        >
          Services
        </button>

        <button
          className={`btn rounded-1 shadow-sm  w-25 ${activeTab === "presetquote" ? "btn-dark" : "btn-white"}`}
          onClick={() => setActiveTab("presetquote")}
          style={{ fontSize: "12px" }}
        >
          Preset Quotation
        </button>
        {/* <button
          className={`btn rounded-1 shadow-sm  w-25 ${activeTab === "addComplementary" ? "btn-dark" : "btn-white"}`}
          onClick={() => setActiveTab("addComplementary")}
          style={{ fontSize: "12px" }}
        >
        Add Complementary
        </button> */}
        <button
          className={`btn rounded-1 shadow-sm  w-25 ${activeTab === "addReferenceFrom" ? "btn-dark" : "btn-white"}`}
          onClick={() => setActiveTab("addReferenceFrom")}
          style={{ fontSize: "12px" }}
        >
          Add Reference
        </button>
        <button
          className={`btn rounded-1 shadow-sm  w-25 ${activeTab === "addAdditionalServices" ? "btn-dark" : "btn-white"}`}
          onClick={() => setActiveTab("addAdditionalServices")}
          style={{ fontSize: "12px" }}
        >
          Add Additional Services
        </button>
      </div>

      <div>{renderContent()}</div>
    </div>
  );
};

export default Master;
