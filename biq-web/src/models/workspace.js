class WorkspaceModel {

    constructor(data) {
        this.id = data._id || null;
        this.mapCenter = data.mapCenter || null;
        this.basemapAttr = data.basemapAttr || '';
        this.basemapUrl = data.basemapUrl || '';
        this.initZoom = data.initZoom || '';
        this.displayName = data.displayName || '';
        this.alias = data.alias || '';
        this.tilePicture = data.tilePicture || '';
        this.billboardFile = data.billboardFile || '';
        this.demandPtsFile = data.demandPtsFile || '';

        this.maxZoom = data.maxZoom || null;
        this.minZoom = data.minZoom || null;
        this.mapBounds = data.mapBounds || null;
    }
}

export default WorkspaceModel;