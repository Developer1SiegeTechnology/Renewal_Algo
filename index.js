// Requirments to use this template
// Must have Node.js
// Install axios
// This can be done using npm
const axios = require("axios");
const CLIENT_ID = "";
const CLIENT_SECRET = "";
const REFRESH_TOKEN = "";
const AUTH_URL = "https://accounts.zoho.com/oauth/v2/token";
const AUTH_PARAMS = `?refresh_token=${REFRESH_TOKEN}&grant_type=refresh_token&client_id=${CLIENT_ID}&client_secret=${CLIENT_SECRET}`;

// Authenticate User for API Call
// Returns new Access_Token
axios({ method: "POST", url: `${AUTH_URL}${AUTH_PARAMS}` })
  .then((resp) => {
    // console.log(resp.data);
    return resp.data.access_token;
  })
  .then((token) => {
    // Make the Api call here
    // User may have to add additional
    // arguments for different api calls
    var search = "ACPGLGO3029203764";
    var newPrefix = search.replace(/\s/g, "");
    var newSuffix = "";
    var buildQuery = "";
    var internalSuffix = "";
    var internalPolicySuffix = "";
    var startSearchPos;
    var specialCase = false;
    // If a "-" there may be a suffix
    if (search.includes("-")) {
      // Get suffix of the policy number
      internalPolicySuffix = search
        .replace(/\s/g, "")
        .substr(search.lastIndexOf("-") + 1, search.length);
      // Get Prefix
      // This grabs the search criteria
      newPrefix = search.substr(0, search.lastIndexOf("-")).replace(/-/g, "");
      console.log(newPrefix);
      buildQuery = `select Name, siegeams__Policy_Number from siegeams__Policies where (Name like '%${newPrefix}')`;
    } else if (search.startsWith("ACP")) {
      startSearchPos = getFirstNonAlpha(search);
      specialCase = true;
      newPrefix = search
        .replace(/\s/g, "")
        .replace(/-/g, "")
        .substr(startSearchPos, search.length);
      console.log("INITIAL: ", newPrefix);
      if (newPrefix[0] == "0") {
        internalSuffix = newPrefix.substr(0, 5);
        internalPolicySuffix = parseInt(internalSuffix);
        newPrefix = newPrefix.substr(5, newPrefix.length);
        console.log("Internal Suffix", internalSuffix);
      } else {
        internalSuffix = newPrefix.substr(0, 3);
        internalPolicySuffix = parseInt(internalSuffix);
        newPrefix = newPrefix.substr(3, newPrefix.length);
        console.log("Internal Suffix", internalSuffix);
      }
      console.log("New Prefix", newPrefix);
      console.log("New Suffix", internalPolicySuffix);
      buildQuery = `select Name, siegeams__Policy_Number from siegeams__Policies where (Name like '%${newPrefix}')`;
    }
    // console.log(newPrefix, newSuffix.length);
    // Check if suffix is not longer than 4 characters
    // Any suffix longer than 4 characters is not a suffix
    if (newSuffix.length <= 4 && specialCase) {
      axios({
        method: "POST",
        url: "https://www.zohoapis.com/crm/v2/coql",
        headers: {
          // Type of api auth, this should not change
          Authorization: `Bearer ${token}`,
        },
        data: {
          select_query: buildQuery,
        },
      })
        .then((resp) => {
          var policyToReference = false;
          var referenceData;
          if (!resp.data.data) {
            console.log("No Policy Found");
          }
          // Iterate through response
          for (policy in resp.data.data) {
            if (resp.data.data[policy].siegeams__Policy_Number != null) {
              // Check if exact match
              // This takes care of any spacing or no hyphens
              if (search == resp.data.data[policy].siegeams__Policy_Number) {
                console.log("Perfect Match");
                referenceData = resp.data.data[policy];
                console.log(referenceData);
                break;
              } else {
                // Check To See if the Policy Number
                // contains a hyphen
                if (search.includes("-")) {
                  // Convert Suffix from string into int
                  // Ex. Record Policy Number is WCP1023303-08
                  // policySuffix becomes 8 as an int
                  // because the number from the last dash on is retrieved (WCP1023303-(08))
                  // therefore parseInt(08) becomes 8
                  policySuffix = parseInt(
                    resp.data.data[policy].siegeams__Policy_Number.substr(
                      search.lastIndexOf("-") + 1,
                      search.length
                    )
                  );
                  console.log("Internal Policy Suffix", policySuffix);
                }
                // Get Record Policy Suffix
                else if (internalSuffix.length == 5) {
                  // Find position of first occurence of a Number
                  startSearchPos = getFirstNonAlpha(
                    resp.data.data[policy].siegeams__Policy_Number
                  );
                  // Get the "Suffix" from the Record Policy Number
                  // Ex. Record Policy Number is ACPCG013038542334
                  // policySuffix becomes 1303 as an int
                  // because the first position of a number up to
                  // the specific location (depending on the previously discovered format)
                  // is retrieved so (ACPCG(01303)8542334) becomes parseInt(01303) therefore 1303
                  policySuffix = parseInt(
                    resp.data.data[policy].siegeams__Policy_Number.substr(
                      startSearchPos,
                      5
                    )
                  );
                  console.log(policySuffix);
                }
                // Get Record Policy Suffix
                else if (internalSuffix.length == 3) {
                  // Find position of first occurence of a Number
                  startSearchPos = getFirstNonAlpha(
                    resp.data.data[policy].siegeams__Policy_Number
                  );
                  // Get the "Suffix" from the Record Policy Number
                  // Ex. Record Policy Number is ACPCG013038542334
                  // policySuffix becomes 300 as an int
                  // because the first position of a number up to
                  // the specific location (depending on the previously discovered format)
                  // is retrieved so (ACPGLGO(300)9797715) becomes parseInt(300) therefore 300
                  policySuffix = parseInt(
                    resp.data.data[policy].siegeams__Policy_Number.substr(
                      startSearchPos,
                      3
                    )
                  );
                  console.log(policySuffix);
                }
                // If the suffix is one more than the renewal
                // Found Match
                if (internalPolicySuffix - 1 === policySuffix) {
                  if (specialCase) {
                    let getRecordPrefixEndPos = getFirstNonAlpha(
                      resp.data.data[policy].siegeams__Policy_Number
                    );
                    let recordPolicyNumberPrefix = resp.data.data[
                      policy
                    ].siegeams__Policy_Number.substr(0, getRecordPrefixEndPos);
                    let getPrefixEndPos = getFirstNonAlpha(search);
                    let policyNumberPrefix = search.substr(0, getPrefixEndPos);
                    console.log(
                      "Compare: ",
                      recordPolicyNumberPrefix,
                      " to ",
                      policyNumberPrefix
                    );
                    if (policyNumberPrefix == recordPolicyNumberPrefix) {
                      console.log("Found Match");
                      referenceData = resp.data.data[policy];
                      console.log(referenceData);
                    } else {
                      console.log("No Match");
                      referenceData = resp.data.data[policy];
                      console.log(referenceData);
                    }
                  } else {
                    console.log("Found Match");
                    referenceData = resp.data.data[policy];
                    console.log(referenceData);
                  }
                }
                // Otherwise No Match
                else {
                  console.log("No Match");
                  referenceData = resp.data.data[policy];
                  console.log(referenceData);
                }
              }
            }
            // if (policyToReference) {
            //   console.log("Policy Information Found: ", referenceData);
            // }
          }
        })
        .catch((err) => console.log(err, "ME"));
    }
    // If suffix is longer than 4 we know there is no suffix change
    else {
      // Remove all whitespace and dashes to be able to search database
      search = search.replace(/-/g, "").replace(/\s/g, "");
      axios({
        method: "POST",
        url: "https://www.zohoapis.com/crm/v2/coql",
        headers: {
          // Type of api auth, this should not change
          Authorization: `Bearer ${token}`,
        },
        data: {
          select_query: `select Name, siegeams__Policy_Number from siegeams__Policies where (Name = '${search}')`,
        },
      }).then((resp) => {
        // Policy Match
        if (resp.data.data) {
          console.log("Found Match: ", resp.data.data);
        } else {
          console.log("No Policy Found");
        }
      });
    }
  });

var getFirstNonAlpha = (str) => {
  for (var i = 0; i < str.length; i++) {
    if (!isNaN(str[i])) {
      return i;
    }
  }
  return false;
};
