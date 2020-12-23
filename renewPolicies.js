const axios = require("axios");
const fs = require("fs");

const CLIENT_ID = "";
const CLIENT_SECRET = "";
const REFRESH_TOKEN = "";
const AUTH_URL = "https://accounts.zoho.com/oauth/v2/token";
const AUTH_PARAMS = `?refresh_token=${REFRESH_TOKEN}&grant_type=refresh_token&client_id=${CLIENT_ID}&client_secret=${CLIENT_SECRET}`;

const NAIC_FILE_DATA = JSON.parse(fs.readFileSync("NAIC.json").toString())[0];
const JSON_FILE_DATA = JSON.parse(fs.readFileSync("test.json"))["data"];

// Get first position of a Numeric Number in a string
var getFirstNonAlpha = (str) => {
  for (var i = 0; i < str.length; i++) {
    if (!isNaN(str[i])) {
      return i;
    }
  }
  return false;
};
var apiCall = async () => {
  var resp = await axios({ method: "POST", url: `${AUTH_URL}${AUTH_PARAMS}` });
  var token = resp.data.access_token;
  for (i in JSON_FILE_DATA) {
    var policySuffix,
      formattedPolicyNumber,
      internalSuffix,
      buildQuery,
      policyPrefix;
    JSON_FILE_DATA[i].siegeams__Insurance_Carrier =
      NAIC_FILE_DATA[`${JSON_FILE_DATA[i]["siegeams__NAIC_Code"]}`][
        "Insurance_Carrier"
      ];
    JSON_FILE_DATA[i].siegeams__Carrier_Website =
      NAIC_FILE_DATA[`${JSON_FILE_DATA[i]["siegeams__NAIC_Code"]}`][
        "Insurance_URL"
      ];
    // console.log(JSON_FILE_DATA[i]);
    // Format For Search
    if (JSON_FILE_DATA[i].siegeams__Insurance_Carrier == "Markel") {
      if (
        JSON_FILE_DATA[i].siegeams__Policy_Type == "Commercial" &&
        JSON_FILE_DATA[i].siegeams__Policy_Number.includes("-")
      ) {
        // Get suffix 123456-(01) => get 01 from Policy Number
        policySuffix = JSON_FILE_DATA[i].siegeams__Policy_Number
          .replace(/\s/g, "")
          .substr(
            JSON_FILE_DATA[i].siegeams__Policy_Number.lastIndexOf("-") + 1,
            JSON_FILE_DATA[i].siegeams__Policy_Number.length
          );
        // Remove Suffix for Search
        formattedPolicyNumber = JSON_FILE_DATA[
          i
        ].siegeams__Policy_Number.substr(
          0,
          JSON_FILE_DATA[i].siegeams__Policy_Number.lastIndexOf("-")
        );
        console.log(formattedPolicyNumber);
        JSON_FILE_DATA[i].Name = formattedPolicyNumber;
        buildQuery = `select Name, siegeams__Policy_Number from siegeams__Policies where (Name like '${formattedPolicyNumber}%')`;
      } else {
        policySuffix = JSON_FILE_DATA[i].Name;
        buildQuery = `select Name, siegeams__Policy_Number from siegeams__Policies where (Name = '${policySuffix}')`;
      }
    } else if (JSON_FILE_DATA[i].siegeams__Insurance_Carrier == "Progressive") {
      if (
        JSON_FILE_DATA[i].siegeams__Policy_Type == "Commercial" &&
        JSON_FILE_DATA[i].siegeams__Policy_Number.includes("-")
      ) {
        // Get suffix 123456-(1) => get 1 from Policy Number
        policySuffix = JSON_FILE_DATA[i].siegeams__Policy_Number
          .replace(/\s/g, "")
          .substr(
            JSON_FILE_DATA[i].siegeams__Policy_Number.lastIndexOf("-") + 1,
            JSON_FILE_DATA[i].siegeams__Policy_Number.length
          );
        // Remove Suffix for Search
        formattedPolicyNumber = JSON_FILE_DATA[
          i
        ].siegeams__Policy_Number.substr(
          0,
          JSON_FILE_DATA[i].siegeams__Policy_Number.lastIndexOf("-")
        );
        buildQuery = `select Name, siegeams__Policy_Number from siegeams__Policies where (Name like '${formattedPolicyNumber}%')`;
      } else if (JSON_FILE_DATA[i].siegeams__Policy_Type == "Personal") {
        policySuffix = JSON_FILE_DATA[i].Name;
        buildQuery = `select Name, siegeams__Policy_Number from siegeams__Policies where (Name = '${policySuffix}')`;
      } else {
        policySuffix = JSON_FILE_DATA[i].Name;
        buildQuery = `select Name, siegeams__Policy_Number from siegeams__Policies where (Name = '${policySuffix}')`;
      }
    } else if (JSON_FILE_DATA[i].siegeams__Insurance_Carrier == "Nationwide") {
      if (
        JSON_FILE_DATA[i].siegeams__Policy_Type == "Commercial" &&
        JSON_FILE_DATA[i].siegeams__Policy_Number.startsWith("ACP")
      ) {
        var startSearchPos = getFirstNonAlpha(
          JSON_FILE_DATA[i].siegeams__Policy_Number
        );
        policySuffix = JSON_FILE_DATA[i].siegeams__Policy_Number
          .replace(/\s/g, "")
          .replace(/-/g, "")
          .substr(
            startSearchPos,
            JSON_FILE_DATA[i].siegeams__Policy_Number.length
          );
        if (policySuffix[0] == "0") {
          internalSuffix = parseInt(policySuffix.substr(0, 5));
          policyPrefix = JSON_FILE_DATA[i].siegeams__Policy_Number.substr(
            0,
            getFirstNonAlpha(JSON_FILE_DATA[i].siegeams__Policy_Number)
          );
        } else {
          internalSuffix = parseInt(policySuffix.substr(0, 3));
          policyPrefix = JSON_FILE_DATA[i].siegeams__Policy_Number.substr(
            0,
            getFirstNonAlpha(JSON_FILE_DATA[i].siegeams__Policy_Number)
          );
          policySuffix = policySuffix.substr(3, policySuffix.length);
        }
        buildQuery = `select Name, siegeams__Policy_Number from siegeams__Policies where (Name like '%${policySuffix}%')`;
      } else if (JSON_FILE_DATA[i].siegeams__Policy_Type == "Personal") {
        policySuffix = JSON_FILE_DATA[i].siegeams__Policy_Number
          .replace(/\s/g, "")
          .replace(/-/g, "");
        buildQuery = `select Name, siegeams__Policy_Number from siegeams__Policies where (Name = '${policySuffix}')`;
      } else {
        policySuffix = JSON_FILE_DATA[i].Name;
        buildQuery = `select Name, siegeams__Policy_Number from siegeams__Policies where (Name = '${policySuffix}')`;
      }
    } else if (JSON_FILE_DATA[i].siegeams__Insurance_Carrier == "Trexis") {
      policySuffix = JSON_FILE_DATA[i].siegeams__Policy_Number
        .replace(/\s/g, "")
        .replace(/-/g, "");
      buildQuery = `select Name, siegeams__Policy_Number from siegeams__Policies where (Name = '${policySuffix}')`;
    } else if (
      JSON_FILE_DATA[i].siegeams__Insurance_Carrier == "American Freedom"
    ) {
      if (
        JSON_FILE_DATA[i].siegeams__Policy_Type == "Personal" &&
        JSON_FILE_DATA[i].siegeams__Policy_Number.includes("-")
      ) {
        // Grab Suffix 15-4004692-(01) => 01
        policySuffix = JSON_FILE_DATA[i].siegeams__Policy_Number
          .replace(/\s/g, "")
          .substr(
            JSON_FILE_DATA[i].siegeams__Policy_Number.lastIndexOf("-") + 1,
            JSON_FILE_DATA[i].siegeams__Policy_Number.length
          );
        // Remove hyphens and grab until suffix
        // 15-4004692-01 => 154004692
        formattedPolicyNumber = JSON_FILE_DATA[i].siegeams__Policy_Number
          .substr(0, JSON_FILE_DATA[i].siegeams__Policy_Number.lastIndexOf("-"))
          .replace(/-/g, "")
          .replace(/\s/g, "");
        buildQuery = `select Name, siegeams__Policy_Number from siegeams__Policies where (Name like '%${formattedPolicyNumber}%')`;
      } else {
        policySuffix = JSON_FILE_DATA[i].Name;
        buildQuery = `select Name, siegeams__Policy_Number from siegeams__Policies where (Name = '${policySuffix}')`;
      }
    } else if (
      JSON_FILE_DATA[i].siegeams__Insurance_Carrier == "National General"
    ) {
      if (
        JSON_FILE_DATA[i].siegeams__Policy_Type == "Commercial" &&
        JSON_FILE_DATA[i].siegeams__Policy_Number.includes("-")
      ) {
        // Get suffix 123456-(78) => get 78 from Policy Number
        policySuffix = JSON_FILE_DATA[i].siegeams__Policy_Number
          .replace(/\s/g, "")
          .substr(
            JSON_FILE_DATA[i].siegeams__Policy_Number.lastIndexOf("-") + 1,
            JSON_FILE_DATA[i].siegeams__Policy_Number.length
          );
        // Remove Suffix for Search
        formattedPolicyNumber = JSON_FILE_DATA[
          i
        ].siegeams__Policy_Number.substr(
          0,
          JSON_FILE_DATA[i].siegeams__Policy_Number.lastIndexOf("-")
        );
        buildQuery = `select Name, siegeams__Policy_Number from siegeams__Policies where (Name like '%${formattedPolicyNumber}%')`;
      } else if (JSON_FILE_DATA[i].siegeams__Policy_Type == "Personal") {
        policySuffix = JSON_FILE_DATA[i].Name;
        buildQuery = `select Name, siegeams__Policy_Number from siegeams__Policies where (Name = '${policySuffix}')`;
      } else {
        policySuffix = JSON_FILE_DATA[i].Name;
        buildQuery = `select Name, siegeams__Policy_Number from siegeams__Policies where (Name = '${policySuffix}')`;
      }
    } else if (JSON_FILE_DATA[i].siegeams__Insurance_Carrier == "Dairyland") {
      if (JSON_FILE_DATA[i].siegeams__Policy_Type == "Personal") {
        policySuffix = JSON_FILE_DATA[i].Name;
        buildQuery = `select Name, siegeams__Policy_Number from siegeams__Policies where (Name = '${policySuffix}')`;
      } else {
        policySuffix = JSON_FILE_DATA[i].Name;
        buildQuery = `select Name, siegeams__Policy_Number from siegeams__Policies where (Name = '${policySuffix}')`;
      }
    } else if (JSON_FILE_DATA[i].siegeams__Insurance_Carrier == "PGA") {
      if (JSON_FILE_DATA[i].siegeams__Policy_Type == "Personal") {
        policySuffix = JSON_FILE_DATA[i].Name;
        buildQuery = `select Name, siegeams__Policy_Number from siegeams__Policies where (Name = '${policySuffix}')`;
      } else {
        policySuffix = JSON_FILE_DATA[i].Name;
        buildQuery = `select Name, siegeams__Policy_Number from siegeams__Policies where (Name = '${policySuffix}')`;
      }
    } else if (JSON_FILE_DATA[i].siegeams__Insurance_Carrier == "Grange") {
      if (
        JSON_FILE_DATA[i].siegeams__Policy_Type == "Personal" &&
        JSON_FILE_DATA[i].siegeams__Policy_Number.includes(" ")
      ) {
        // Covert HM 123456 => HM123456
        policySuffix = JSON_FILE_DATA[i].siegeams__Policy_Number
          .replace(/\s/g, "")
          .replace(/-/g, "");
        buildQuery = `select Name, siegeams__Policy_Number from siegeams__Policies where (Name = '${policySuffix}')`;
      } else {
        policySuffix = JSON_FILE_DATA[i].Name;
        buildQuery = `select Name, siegeams__Policy_Number from siegeams__Policies where (Name = '${policySuffix}')`;
      }
    } else if (
      JSON_FILE_DATA[i].siegeams__Insurance_Carrier == "Main Street America"
    ) {
      if (JSON_FILE_DATA[i].siegeams__Policy_Type == "Commercial") {
        policySuffix = JSON_FILE_DATA[i].siegeams__Policy_Number
          .replace(/\s/g, "")
          .replace(/-/g, "");
        buildQuery = `select Name, siegeams__Policy_Number from siegeams__Policies where (Name = '${policySuffix}')`;
      } else {
        policySuffix = JSON_FILE_DATA[i].Name;
        buildQuery = `select Name, siegeams__Policy_Number from siegeams__Policies where (Name = '${policySuffix}')`;
      }
    } else if (JSON_FILE_DATA[i].siegeams__Insurance_Carrier == "Mendota") {
      if (JSON_FILE_DATA[i].siegeams__Policy_Type == "Personal") {
        policySuffix = JSON_FILE_DATA[i].siegeams__Policy_Number
          .replace(/\s/g, "")
          .replace(/-/g, "");
        buildQuery = `select Name, siegeams__Policy_Number from siegeams__Policies where (Name = '${policySuffix}')`;
      } else {
        policySuffix = JSON_FILE_DATA[i].Name;
        buildQuery = `select Name, siegeams__Policy_Number from siegeams__Policies where (Name = '${policySuffix}')`;
      }
    } else if (JSON_FILE_DATA[i].siegeams__Insurance_Carrier == "Hartford") {
      if (JSON_FILE_DATA[i].siegeams__Policy_Type == "Commercial") {
        policySuffix = JSON_FILE_DATA[i].siegeams__Policy_Number
          .replace(/\s/g, "")
          .replace(/-/g, "");
        buildQuery = `select Name, siegeams__Policy_Number from siegeams__Policies where (Name = '${policySuffix}')`;
      } else {
        policySuffix = JSON_FILE_DATA[i].Name;
        buildQuery = `select Name, siegeams__Policy_Number from siegeams__Policies where (Name = '${policySuffix}')`;
      }
    } else if (JSON_FILE_DATA[i].siegeams__Insurance_Carrier == "Gainsco") {
      if (
        JSON_FILE_DATA[i].siegeams__Policy_Type == "Personal" &&
        JSON_FILE_DATA[i].siegeams__Policy_Number.includes("-")
      ) {
        // Get suffix 123456-(01) => get 01 from Policy Number
        policySuffix = JSON_FILE_DATA[i].siegeams__Policy_Number
          .replace(/\s/g, "")
          .substr(
            JSON_FILE_DATA[i].siegeams__Policy_Number.lastIndexOf("-") + 1,
            JSON_FILE_DATA[i].siegeams__Policy_Number.length
          );
        // Remove Suffix for Search
        formattedPolicyNumber = JSON_FILE_DATA[
          i
        ].siegeams__Policy_Number.substr(
          0,
          JSON_FILE_DATA[i].siegeams__Policy_Number.lastIndexOf("-")
        );
        buildQuery = `select Name, siegeams__Policy_Number from siegeams__Policies where (Name like '%${formattedPolicyNumber}%')`;
      } else {
        policySuffix = JSON_FILE_DATA[i].Name;
        buildQuery = `select Name, siegeams__Policy_Number from siegeams__Policies where (Name = '${policySuffix}')`;
      }
    } else {
      policySuffix = JSON_FILE_DATA[i].Name;
      buildQuery = `select Name, siegeams__Policy_Number from siegeams__Policies where (Name = '${policySuffix}')`;
    }
    // Make the Api call here
    // User may have to add additional
    // arguments for different api calls
    resp = await axios({
      method: "POST",
      url: "https://www.zohoapis.com/crm/v2/coql",
      headers: {
        // Type of api auth, this should not change
        Authorization: `Bearer ${token}`,
      },
      data: {
        select_query: buildQuery,
      },
    });
    var foundRenewal, policyInfo, exactMatch;
    if (!resp.data.data) {
      console.log("No Policy Match Therefore Create New Policy");
    }
    for (policy in resp.data.data) {
      if (resp.data.data[policy].siegeams__Policy_Number != null) {
        console.log(
          `Compare: Res: ${resp.data.data[policy].siegeams__Policy_Number} to File: ${JSON_FILE_DATA[i].siegeams__Policy_Number}`
        );
        if (
          JSON_FILE_DATA[i].siegeams__Policy_Number ==
          resp.data.data[policy].siegeams__Policy_Number
        ) {
          policyInfo = resp.data.data[policy];
          exactMatch = true;
          console.log("Exact Match");
        } else if (
          resp.data.data[policy].siegeams__Policy_Number.includes("-")
        ) {
          let filePolicySuffix = parseInt(policySuffix);
          let responseSuffix = parseInt(
            resp.data.data[policy].siegeams__Policy_Number.substr(
              resp.data.data[policy].siegeams__Policy_Number.lastIndexOf("-") +
                1,
              resp.data.data[policy].siegeams__Policy_Number.length
            )
          );
          if (filePolicySuffix - 1 === responseSuffix && !exactMatch) {
            console.log("Found Renewal");
            policyInfo = resp.data.data[policy];
            foundRenewal = true;
          } else if (!foundRenewal && !exactMatch) {
            console.log(foundRenewal);
            console.log("New Policy");
            policyInfo = resp.data.data[policy];
          }
        } else if (
          resp.data.data[policy].siegeams__Policy_Number.includes("ACP") &&
          resp.data.data[policy].siegeams__Policy_Number.includes(
            policyPrefix
          ) &&
          resp.data.data[policy].siegeams__Policy_Number.includes(policySuffix)
        ) {
          let responseInternalSuffix = parseInt(
            resp.data.data[policy].siegeams__Policy_Number.substr(
              getFirstNonAlpha(resp.data.data[policy].siegeams__Policy_Number),
              internalSuffix.toString().length
            )
          );
          console.log(internalSuffix - 1, responseInternalSuffix);
          if (internalSuffix - 1 === responseInternalSuffix) {
            console.log("Found Renewal");
            policyInfo = resp.data.data[policy];
            foundRenewal = true;
          } else if (!foundRenewal) {
            console.log("New Policy");
            policyInfo = resp.data.data[policy];
          }
        }
      } else {
        console.log("Update Record");
      }
    }
  }
  console.log(policyInfo);
};
apiCall();
