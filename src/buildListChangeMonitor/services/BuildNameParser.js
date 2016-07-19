'use strict';

function splitPrefix(name) {
  var matched = name.match(/^(a|aa|w|ww|x|xx|y|yy|z|zz)_?(.*)$/);
  return {
    prefix: matched && matched[1] || null,
    remainder: matched && matched[2] || name
  };
}

function splitNameBranch(name) {
  var matched = name.match(/^([^_]+)_?(.*)?$/);
  return {
    name: matched && matched[1] || name,
    branch: matched && matched[2] || null
  };
}

function humanize(input) {
  if (!input) return input;
  var camelCaseToSpace = /([A-Z])([A-Z])([a-z])|([a-z])([A-Z])/g
  return (input
    .replace(camelCaseToSpace, '$1$4 $2$3$5')
    .replace(/_/g, ' ')
  );
}

function tweakBranchName(branch) {
  return (
    (branch == "Priv") && "Private"
    || branch
  );
}

module.exports = function() {
  return {
    parse: function(name) {
      // there are a few possibilities:
      // e.g. a_ChinaCountryPack_4.4_Release_DO_NOT_DELETE
      //   == a_ActualName_BranchName
      // e.g. AirConditioning_4.5.5
      //   == ActualName_BranchName
      // e.g. Vista.Localisation.LangFileProvider
      //   == ActualName
      // e.g. VistaConnect_WPM_Installer
      //   == ActualName                    <-- needs manual override
      // e.g. w_FilmProgramming_4.4_FP_R_512.16
      //   == w_ActualName_BranchName       <-- 'w_' could also be 'w', 'x_', 'y_', 'xx_', 'x'

      var prefix = splitPrefix(name);
      name = prefix.remainder;
      prefix = prefix.prefix;

      var branch = splitNameBranch(name);
      name = branch.name;
      branch = branch.branch;

      return {
        prefix: prefix,
        name: humanize(name),
        branch: humanize(tweakBranchName(branch))
      }

    }
  };
};
