class WorkspaceModel {

    constructor(data) {
        this.id = data._id || null;
        this.mapCenter = data.mapCenter || null;
        this.basemapAttr = data.basemapAttr || '';
        this.basemapUrl = data.basemapUrl || '';
        this.zoomLevel = data.zoomLevel || '';
        this.displayName = data.displayName || '';
        this.alias = data.alias || '';
        this.tilePicture = data.tilePicture || '';
        this.billboardFile = data.billboardFile || '';
        this.demandPtsFile = data.demandPtsFile || '';
    }
}

export default WorkspaceModel;