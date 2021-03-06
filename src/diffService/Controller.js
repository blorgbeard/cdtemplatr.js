'use strict';

var Promise = require('bluebird');
var log = requireShared('log')("Controller");

var Diff = requireShared('domain/model/Diff'); 

module.exports = function(domain, tfs, diffService) {
  return {
    ensure: function (buildDefinitionId) {
      return domain.build.get(buildDefinitionId).then(build => {
        
        var buildHasDiffInputData = (
          (build.latest) &&
          (build.latest.tfs) &&
          (build.latest.tfs.location) &&
          (build.latest.output)
        );

        if (!buildHasDiffInputData) {
          log.trace(`Build ${buildDefinitionId} does not have both tfs and build output versions of cd-template - nothing to diff.`);
          return;
        }

        var outOfDate = (
          (!build.diff) ||
          (!build.diff.tfs) ||
          (build.diff.tfs.location !== build.latest.tfs.location) ||
          (!build.diff.tfs.revision || (parseInt(build.diff.tfs.revision) < parseInt(build.latest.tfs.revision))) ||
          (!build.diff.output || parseInt(build.diff.output) < parseInt(build.latest.output))
        );

        if (!outOfDate) {
          log.trace(`Build ${buildDefinitionId} already has an up to date diff.`);
          return;
        };

        return Promise.all([
          domain.diff.getDocumentRevision(buildDefinitionId),
          domain.outputCd.get(buildDefinitionId),
          tfs.getFileWithMetadata(build.latest.tfs.location)
        ]).then(results => {
          var oldRevison = results[0];
          var outputCd = results[1];
          var tfsCd = results[2];

          // validate we got the expected versions
          if (parseInt(outputCd.buildId) < build.latest.outputCd) {
            log.error(`Build definition ${buildDefinitionId} says ${build.latest.outputCd} is latest build, but latest recorded is only ${outputCd.buildId}. Skipping diff.`);
            return;
          }
          if (build.latest.tfs.revision && (tfsCd.metadata.version < build.latest.tfs.revision)) {
            log.error(`Build definition ${buildDefinitionId} says ${build.latest.tfs.revision} is latest cdtemplate, but latest in tfs is only ${tfsCd.metadata.version}. Skipping diff.`);
            return;
          }
  
          // do diff (this seems fast enough if the files are not completely different)
          log.debug(`Beginning diff of cdtemplate from build ${outputCd.buildId} and ${tfsCd.metadata.path} revision ${tfsCd.metadata.version}`);
          var newDiff = diffService(tfsCd.data, outputCd.data);
          log.debug(`Completed diff of cdtemplate from build ${outputCd.buildId} and ${tfsCd.metadata.path} revision ${tfsCd.metadata.version}`);
          
          // todo: ignore certain changes

          var newDiffDoc = new Diff(
            buildDefinitionId, 
            tfsCd.metadata.path,
            tfsCd.metadata.version,
            outputCd.buildId);

          newDiffDoc.data = newDiff;

          newDiffDoc._rev = oldRevison;

          return domain.diff.put(newDiffDoc).then(() => {
            build.diff = newDiffDoc.version;
            build.hasChanges = newDiffDoc.data.additions.length > 0 || 
                               newDiffDoc.data.deletions.length > 0;
            return domain.build.saveBuild(build);
          });

        });
      });
    }
  };
};