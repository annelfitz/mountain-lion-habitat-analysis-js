import "./styles.css";

import "@arcgis/map-components/components/arcgis-map";
import "@arcgis/map-components/components/arcgis-home";
import "@arcgis/map-components/components/arcgis-zoom";
import "@esri/calcite-components/components/calcite-shell";
import "@esri/calcite-components/components/calcite-shell-panel";
import "@esri/calcite-components/components/calcite-panel";
import "@esri/calcite-components/components/calcite-action-bar";
import "@esri/calcite-components/components/calcite-action";
import "@esri/calcite-components/components/calcite-list";
import "@esri/calcite-components/components/calcite-list-item";
import "@esri/calcite-components/components/calcite-icon";
import "@esri/calcite-components/components/calcite-chip";
import "@esri/calcite-components/components/calcite-slider";
import "@esri/calcite-components/components/calcite-progress";

import Graphic from "@arcgis/core/Graphic";
import Map from "@arcgis/core/Map";
import Basemap from "@arcgis/core/Basemap";
import VectorTileLayer from "@arcgis/core/layers/VectorTileLayer";
import GroupLayer from "@arcgis/core/layers/GroupLayer";
import Layer from "@arcgis/core/layers/Layer";
import Polygon from "@arcgis/core/geometry/Polygon";
import * as reactiveUtils from "@arcgis/core/core/reactiveUtils";
import GraphicsLayer from "@arcgis/core/layers/GraphicsLayer";
import ImageryTileLayer from "@arcgis/core/layers/ImageryTileLayer";
import RasterFunction from "@arcgis/core/layers/support/RasterFunction";
import {
  cellStatisticalOperation,
  localArithmeticOperation,
} from "@arcgis/core/layers/support/rasterFunctionConstants";
import { byName } from "@arcgis/core/smartMapping/symbology/support/colorRamps";

const homeElement = document.getElementById("homeElement");
const mapElement = document.getElementById("mapElement");
const insetMapElement = document.getElementById("insetMapElement");
const filterShellPanel = document.getElementById("filterShellPanel");
const filterPanel = document.getElementById("filterPanel");
const filterList = document.getElementById("filterList");
const mobileFilterActionBar = document.getElementById("mobileFilterActionBar");
const mobileFilterActions = Array.from(
  mobileFilterActionBar?.querySelectorAll("calcite-action") ?? [],
);
const distanceToRoadSlider = document.getElementById("distanceToRoadSlider");
const terrainRuggednessSlider = document.getElementById(
  "terrainRuggednessSlider",
);
const distanceToRoadMinStat = document.getElementById("distanceToRoadMinStat");
const distanceToRoadMaxStat = document.getElementById("distanceToRoadMaxStat");
const terrainRuggednessMinStat = document.getElementById(
  "terrainRuggednessMinStat",
);
const terrainRuggednessMaxStat = document.getElementById(
  "terrainRuggednessMaxStat",
);

const filterItems = Array.from(
  filterList.querySelectorAll("calcite-list-item"),
);

const wholeNumberFormatter = new Intl.NumberFormat("en-US");

mapElement.dataset.loaded = "false";

async function ensureCustomElementsReady() {
  await Promise.all([
    globalThis.customElements.whenDefined("arcgis-map"),
    globalThis.customElements.whenDefined("calcite-slider"),
    globalThis.customElements.whenDefined("calcite-progress"),
  ]);
}

async function fadeMapBackgroundAfterLoad(mapComponent) {
  if (!mapComponent) {
    return;
  }

  await reactiveUtils.whenOnce(() => !mapComponent.updating);
  mapComponent.dataset.loaded = "true";
}

function getSliderNumericValue(slider, propertyName, attributeName) {
  const propertyValue = Number(slider?.[propertyName]);

  if (Number.isFinite(propertyValue)) {
    return propertyValue;
  }

  const attributeValue = Number(slider?.getAttribute(attributeName));
  return Number.isFinite(attributeValue) ? attributeValue : 0;
}

function getSliderRange(slider) {
  return [
    getSliderNumericValue(slider, "minValue", "min-value"),
    getSliderNumericValue(slider, "maxValue", "max-value"),
  ];
}

function syncRangeStats(slider, minElement, maxElement, unit) {
  const [minValue, maxValue] = getSliderRange(slider);
  minElement.textContent = `${wholeNumberFormatter.format(Math.round(minValue))} ${unit}`;
  maxElement.textContent = `${wholeNumberFormatter.format(Math.round(maxValue))} ${unit}`;
}

function getSelectedLayerId() {
  return filterItems.find((item) => item.selected)?.value;
}

function syncFilterItemDescriptions(selectedLayerId) {
  filterItems.forEach((item) => {
    const description =
      item.value === selectedLayerId
        ? (item.dataset.description?.trim() ?? "")
        : "";

    if (description) {
      item.description = description;
      return;
    }

    item.description = "";
    item.removeAttribute("description");
  });
}

const INSET_BASEMAP_ID = "2613486fd0d64002ab733a7cd3979b77";
const HIGHLIGHT_EXTENT_OUTLINE_COLOR = [197, 109, 71, 1];
const MAIN_MASK_FILL_COLOR = [208, 183, 159, 0.3];
const INSET_MASK_FILL_COLOR = [208, 183, 159, 0.6];
const INSET_OVERVIEW_ZOOM = 4;
const INSET_DEFAULT_ZOOM = INSET_OVERVIEW_ZOOM + 1;
const INSET_SYNC_ZOOM_THRESHOLD = 10;
const INSET_DETAIL_ZOOM_THRESHOLD = 12;
const INSET_MEDIUM_ZOOM = 7;
const INSET_DETAIL_ZOOM = 8;

function getSharedExtent(layers) {
  const extents = layers.map((layer) => layer.fullExtent).filter(Boolean);

  if (!extents.length) {
    return null;
  }

  return extents.reduce(
    (sharedExtent, extent) => sharedExtent.intersection(extent) ?? sharedExtent,
    extents[0].clone(),
  );
}

function createOutlineSymbol(style) {
  return {
    type: "simple-fill",
    color: [0, 0, 0, 0],
    outline: {
      type: "simple-line",
      color: HIGHLIGHT_EXTENT_OUTLINE_COLOR,
      width: 2,
      style,
    },
  };
}

function createMaskGeometry(extent) {
  const { spatialReference } = extent;
  const outerRing = spatialReference?.isGeographic
    ? [
        [-180, -90],
        [-180, 90],
        [180, 90],
        [180, -90],
        [-180, -90],
      ]
    : [
        [-20037508.3427892, -20037508.3427892],
        [-20037508.3427892, 20037508.3427892],
        [20037508.3427892, 20037508.3427892],
        [20037508.3427892, -20037508.3427892],
        [-20037508.3427892, -20037508.3427892],
      ];

  return new Polygon({
    rings: [outerRing, Polygon.fromExtent(extent).rings[0].slice().reverse()],
    spatialReference,
  });
}

function updateOverlayGraphics({ extent, maskGraphic, outlineGraphic }) {
  maskGraphic.geometry = createMaskGeometry(extent);
  outlineGraphic.geometry = Polygon.fromExtent(extent);
}

function getInsetZoom(mainZoom) {
  if (mainZoom >= INSET_DETAIL_ZOOM_THRESHOLD) {
    return INSET_DETAIL_ZOOM;
  }

  if (mainZoom >= INSET_SYNC_ZOOM_THRESHOLD) {
    return INSET_MEDIUM_ZOOM;
  }

  return INSET_DEFAULT_ZOOM;
}

async function addExtentOverlay({ layers, map }) {
  await Promise.all(layers.map((layer) => layer.load())).catch((error) => {
    console.error("Error loading layers for extent overlay:", error);
    return null;
  });

  const sharedExtent = getSharedExtent(layers);
  if (!sharedExtent) {
    return null;
  }

  const maskGraphic = new Graphic({
    symbol: { type: "simple-fill", color: MAIN_MASK_FILL_COLOR, outline: null },
  });
  const outlineGraphic = new Graphic({
    symbol: createOutlineSymbol("short-dot"),
  });

  updateOverlayGraphics({
    extent: sharedExtent,
    maskGraphic,
    outlineGraphic,
  });

  const extentOutlineLayer = new GraphicsLayer({
    listMode: "hide",
    popupEnabled: false,
    graphics: [maskGraphic, outlineGraphic],
  });

  map.add(extentOutlineLayer);
  return sharedExtent;
}

async function setupInsetMap() {
  if (!insetMapElement) {
    return;
  }

  insetMapElement.dataset.loaded = "false";

  const insetPortalLayer = await Layer.fromPortalItem({
    portalItem: {
      id: INSET_BASEMAP_ID,
    },
  });

  await insetPortalLayer.load();

  const insetExtentGraphic = new Graphic({
    symbol: {
      type: "simple-fill",
      color: INSET_MASK_FILL_COLOR,
      outline: null,
    },
  });

  const insetExtentOutlineGraphic = new Graphic({
    symbol: createOutlineSymbol("solid"),
  });

  const insetExtentLayer = new GraphicsLayer({
    listMode: "hide",
    popupEnabled: false,
    graphics: [insetExtentGraphic, insetExtentOutlineGraphic],
  });

  insetMapElement.map = new Map({
    basemap: "topo-vector",
    layers: [insetPortalLayer, insetExtentLayer],
  });

  if (insetMapElement.ready) {
    await handleInsetMapReady();
  } else {
    await new Promise((resolve, reject) => {
      insetMapElement.addEventListener(
        "arcgisViewReadyChange",
        () => {
          handleInsetMapReady().then(resolve, reject);
        },
        {
          once: true,
        },
      );
    });
  }

  async function handleInsetMapReady() {
    insetMapElement.navigation.mouseWheelZoomEnabled = false;
    insetMapElement.navigation.browserTouchPanEnabled = false;
    insetMapElement.navigation.momentumEnabled = false;
    insetMapElement.popupEnabled = false;
    insetMapElement.highlightOptions = null;
    let insetZoom = getInsetZoom(mapElement.zoom ?? 0);

    const syncInsetZoom = async () => {
      const nextInsetZoom = getInsetZoom(mapElement.zoom ?? 0);

      if (nextInsetZoom === insetZoom) {
        return;
      }

      insetZoom = nextInsetZoom;
      await insetMapElement
        .goTo({ zoom: nextInsetZoom }, { animate: true })
        .catch((error) => {
          console.error("Error syncing inset zoom:", error);
        });
    };

    const syncInsetExtent = (extent = mapElement?.extent) => {
      if (!extent) {
        return;
      }

      updateOverlayGraphics({
        extent,
        maskGraphic: insetExtentGraphic,
        outlineGraphic: insetExtentOutlineGraphic,
      });
    };

    const initialExtent = mapElement.extent?.clone();

    if (!initialExtent) {
      return;
    }

    await insetMapElement
      .goTo(
        {
          center: initialExtent.center,
          zoom: insetZoom,
        },
        { animate: false },
      )
      .catch((error) => {
        console.error("Error setting initial inset view:", error);
      });

    const insetPanBounds = insetMapElement.extent?.clone();
    if (insetPanBounds) {
      insetMapElement.constraints = {
        ...insetMapElement.constraints,
        geometry: insetPanBounds,
      };
    }

    syncInsetExtent(initialExtent);
    await fadeMapBackgroundAfterLoad(insetMapElement);
    reactiveUtils.watch(() => mapElement.extent, syncInsetExtent);
    reactiveUtils.watch(
      () => mapElement.zoom,
      () => {
        void syncInsetZoom();
      },
    );
  }
}

const ROAD_BAND_ID = 0;
const PROTECTED_STATUS_BAND_ID = 1;
const LAND_COVER_BAND_ID = 2;
const TERRAIN_RUGGEDNESS_BAND_ID = 3;
const VTSE_BASEMAP_LAYER_ID = "ef45864f467e4a96a0413dc15587e359";
const VTSE_LABELS_LAYER_ID = "08135613e548423aa27660bad7e649bb";
const MAIN_MAX_ZOOM = 15;
const MAIN_START_ZOOM = 8;
const MOBILE_LAYOUT_QUERY = globalThis.matchMedia("(max-width: 760px)");

function generateColormapRamp(pixelValues, colorRamp) {
  let { colors } = colorRamp.colorsForClassBreaks.find((rampEntry) => {
    return rampEntry.numClasses === pixelValues.length;
  });

  colors = colors.slice().reverse();

  return pixelValues.map((value, index) => {
    const { r, g, b } = colors[index];
    return [value, r, g, b];
  });
}

const ramp = byName("Red and Green 9");
const SUITABILITY_COLORMAP = generateColormapRamp([1, 2, 3, 4, 5, 6, 7], ramp);

function createColormapFunction(raster, colormap) {
  return new RasterFunction({
    functionName: "Colormap",
    functionArguments: {
      colormap,
      raster,
    },
    outputPixelType: "U8",
  });
}

function enablePixelValuesFromColormap(colormap, enabledValues) {
  return colormap.filter((color) => enabledValues.includes(color[0]));
}

function createWeightedFunction(raster, weight) {
  return new RasterFunction({
    functionName: "Local",
    functionArguments: {
      operation: localArithmeticOperation.times,
      rasters: [raster, weight],
    },
    outputPixelType: "F32",
  });
}

function preserveSliderInteraction(slider) {
  if (!slider) {
    return;
  }

  ["pointerdown", "click", "keydown"].forEach((eventName) => {
    slider.addEventListener(eventName, (event) => {
      event.stopPropagation();
    });
  });
}

function createRoadFunction(roadThresholds) {
  return new RasterFunction({
    functionName: "Remap",
    functionArguments: {
      inputRanges: [
        0,
        roadThresholds[0],
        roadThresholds[0],
        roadThresholds[1],
        roadThresholds[1],
        1000000,
      ],
      outputValues: [3, 2, 1],
      raster: new RasterFunction({
        functionName: "ExtractBand",
        functionArguments: { bandIds: [ROAD_BAND_ID] },
      }),
    },
    outputPixelType: "U8",
  });
}

function createProtectedFunction() {
  return new RasterFunction({
    functionName: "Remap",
    functionArguments: {
      inputRanges: [9, 10],
      outputValues: [4],
      allowUnmatched: true,
      raster: new RasterFunction({
        functionName: "ExtractBand",
        functionArguments: { bandIds: [PROTECTED_STATUS_BAND_ID] },
      }),
    },
    outputPixelType: "U8",
  });
}

function createLandCoverFunction() {
  return new RasterFunction({
    functionName: "Remap",
    functionArguments: {
      inputRanges: [
        0, 30, 31, 32, 32, 40, 41, 42, 42, 43, 43, 44, 44, 51, 52, 53, 53, 70,
        71, 72, 72, 74, 75, 76, 76, 80, 81, 82, 82, 83, 83, 200,
      ],
      outputValues: [7, 2, 7, 1, 1, 1, 7, 1, 7, 2, 7, 2, 7, 2, 2, 7],
      raster: new RasterFunction({
        functionName: "ExtractBand",
        functionArguments: { bandIds: [LAND_COVER_BAND_ID] },
      }),
    },
    outputPixelType: "U8",
  });
}

function createTerrainRuggednessFunction(ruggednessThresholds) {
  return new RasterFunction({
    functionName: "Remap",
    functionArguments: {
      inputRanges: [
        0,
        ruggednessThresholds[0],
        ruggednessThresholds[0],
        ruggednessThresholds[1],
        ruggednessThresholds[1],
        300,
      ],
      outputValues: [3, 2, 1],
      raster: new RasterFunction({
        functionName: "ExtractBand",
        functionArguments: { bandIds: [TERRAIN_RUGGEDNESS_BAND_ID] },
      }),
    },
    outputPixelType: "U8",
  });
}

function createHabitatAnalysisFunction(roadThresholds, ruggednessThresholds) {
  const rasters = [
    createWeightedFunction(createRoadFunction(roadThresholds), 0.2),
    createWeightedFunction(createProtectedFunction(), 0.25),
    createWeightedFunction(
      createTerrainRuggednessFunction(ruggednessThresholds),
      0.25,
    ),
    createWeightedFunction(createLandCoverFunction(), 0.3),
  ];

  return new RasterFunction({
    functionName: "Local",
    functionArguments: {
      operation: cellStatisticalOperation.sum,
      rasters,
    },
    outputPixelType: "U8",
  });
}

function setSelectedLayer(layerId) {
  filterItems.forEach((item) => {
    item.selected = item.value === layerId;
  });
}

let insetSetupPromise = null;

async function ensureInsetMapSetup() {
  if (MOBILE_LAYOUT_QUERY.matches || !insetMapElement) {
    return;
  }

  if (!insetSetupPromise) {
    insetSetupPromise = setupInsetMap().catch((error) => {
      insetSetupPromise = null;
      console.error("Error setting up inset map:", error);
    });
  }

  await insetSetupPromise;
}

function syncFilterPanelHeader(selectedLayerId) {
  if (!filterPanel) {
    return;
  }

  const isMobileLayout = MOBILE_LAYOUT_QUERY.matches;

  filterPanel.heading = isMobileLayout ? "Habitat Factor" : "";
  filterPanel.closable = isMobileLayout && Boolean(selectedLayerId);
}

function focusMobileFilterPanel() {
  if (!MOBILE_LAYOUT_QUERY.matches || !filterPanel) {
    return;
  }

  globalThis.requestAnimationFrame(() => {
    filterPanel.setFocus();
  });
}

function focusMobileAction(layerId) {
  if (!MOBILE_LAYOUT_QUERY.matches) {
    return;
  }

  const action =
    mobileFilterActions.find((item) => item.dataset.filterId === layerId) ??
    mobileFilterActions[0];

  if (!action) {
    return;
  }

  globalThis.requestAnimationFrame(() => {
    action.setFocus();
  });
}

function syncResponsiveFilterShell() {
  if (!filterShellPanel) {
    return;
  }

  const selectedLayerId = getSelectedLayerId();
  const isMobileLayout = MOBILE_LAYOUT_QUERY.matches;

  filterShellPanel.slot = isMobileLayout ? "panel-bottom" : "panel-end";
  filterShellPanel.collapsed = isMobileLayout && !selectedLayerId;
  filterShellPanel.displayMode = isMobileLayout ? "overlay" : "dock";

  filterList.slot = isMobileLayout ? "content-top" : "";
  filterList.selectionMode = isMobileLayout ? "none" : "single";

  if (filterPanel) {
    filterPanel.closed = isMobileLayout ? !selectedLayerId : false;
  }

  syncFilterPanelHeader(selectedLayerId);
  syncMobileFilterSelectionUi(selectedLayerId);
  syncViewScale(isMobileLayout);

  if (!isMobileLayout) {
    void ensureInsetMapSetup();
  }
}

function syncViewScale(isMobileLayout) {
  if (!mapElement && !mapElement.constraints) {
    return;
  }
  mapElement.constraints.minZoom = isMobileLayout
    ? MAIN_START_ZOOM - 1
    : MAIN_START_ZOOM;
}

function syncMobileFilterSelectionUi(selectedLayerId) {
  const isMobileLayout = MOBILE_LAYOUT_QUERY.matches;
  filterPanel.scale = isMobileLayout ? "m" : "l";
  filterList.scale = isMobileLayout ? "m" : "l";

  mobileFilterActions.forEach((action) => {
    const isSelected = action.dataset.filterId === selectedLayerId;

    action.toggleAttribute("active", isSelected);
    action.toggleAttribute("selected", isSelected);
  });

  if (isMobileLayout) {
    filterList.setAttribute("interaction-mode", "static");
  }

  filterItems.forEach((item) => {
    const isVisible = !isMobileLayout || item.value === selectedLayerId;
    item.hidden = !isVisible;
  });
}

async function initializeApp() {
  await ensureCustomElementsReady();

  syncResponsiveFilterShell();
  MOBILE_LAYOUT_QUERY.addEventListener("change", syncResponsiveFilterShell);

  let roadThresholds = getSliderRange(distanceToRoadSlider);
  let ruggednessThresholds = getSliderRange(terrainRuggednessSlider);

  const serviceUrl =
    "https://tiledimageservices.arcgis.com/V6ZHFr6zdgNZuVG0/arcgis/rest/services/mountain_lion/ImageServer";

  const distanceToRoadLayer = new ImageryTileLayer({
    id: "distanceToRoad",
    url: serviceUrl,
    rasterFunction: createColormapFunction(
      createRoadFunction(roadThresholds),
      enablePixelValuesFromColormap(SUITABILITY_COLORMAP, [1, 2]),
    ),
    visible: false,
  });

  const protectedStatusLayer = new ImageryTileLayer({
    id: "protectedStatus",
    url: serviceUrl,
    rasterFunction: createColormapFunction(
      createProtectedFunction(),
      enablePixelValuesFromColormap(SUITABILITY_COLORMAP, [1, 2]),
    ),
    visible: false,
  });

  const landCoverLayer = new ImageryTileLayer({
    id: "landCover",
    url: serviceUrl,
    rasterFunction: createColormapFunction(
      createLandCoverFunction(),
      enablePixelValuesFromColormap(SUITABILITY_COLORMAP, [1, 2, 3]),
    ),
    visible: false,
  });

  const terrainRuggednessLayer = new ImageryTileLayer({
    id: "terrainRuggedness",
    url: serviceUrl,
    rasterFunction: createColormapFunction(
      createTerrainRuggednessFunction(ruggednessThresholds),
      enablePixelValuesFromColormap(SUITABILITY_COLORMAP, [1, 2]),
    ),
    visible: false,
  });

  const habitatAnalysisLayer = new ImageryTileLayer({
    id: "habitatAnalysis",
    url: serviceUrl,
    rasterFunction: createColormapFunction(
      createHabitatAnalysisFunction(roadThresholds, ruggednessThresholds),
      enablePixelValuesFromColormap(SUITABILITY_COLORMAP, [1, 2]),
    ),
    visible: false,
  });

  const operationalLayers = [
    distanceToRoadLayer,
    protectedStatusLayer,
    landCoverLayer,
    terrainRuggednessLayer,
    habitatAnalysisLayer,
  ];

  const groupLayer = new GroupLayer({
    visibilityMode: "exclusive",
    layers: operationalLayers,
    visible: false,
  });

  const vtseBasemap = new VectorTileLayer({
    portalItem: {
      id: VTSE_BASEMAP_LAYER_ID,
    },
    listMode: "hide",
    popupEnabled: false,
    effect: "opacity(0.75)",
  });

  const vtseLabels = new VectorTileLayer({
    portalItem: {
      id: VTSE_LABELS_LAYER_ID,
    },
    listMode: "hide",
    popupEnabled: false,
  });

  const map = new Map({
    basemap: new Basemap({
      baseLayers: [vtseBasemap],
      referenceLayers: [vtseLabels],
    }),
    layers: [groupLayer],
  });

  mapElement.map = map;
  if (mapElement.ready) {
    void handleMapReady();
  } else {
    mapElement.addEventListener(
      "arcgisViewReadyChange",
      () => {
        void handleMapReady();
      },
      {
        once: true,
      },
    );
  }

  async function handleMapReady() {
    await ensureInsetMapSetup();

    const highlightedAreaExtent = await addExtentOverlay({
      layers: operationalLayers,
      map,
    });

    if (highlightedAreaExtent) {
      await mapElement.goTo(highlightedAreaExtent, { animate: false });

      if ((mapElement.zoom ?? 0) < MAIN_START_ZOOM) {
        await mapElement.goTo(
          {
            center: mapElement.center,
            zoom: MAIN_START_ZOOM,
          },
          { animate: false },
        );
      }

      if (homeElement) {
        homeElement.viewpoint = mapElement.viewpoint.clone();
      }
      const isMobileLayout = MOBILE_LAYOUT_QUERY.matches;
      const mainPanBounds = highlightedAreaExtent.clone();
      if (mainPanBounds) {
        mapElement.constraints = {
          ...mapElement.constraints,
          geometry: mainPanBounds,
          minZoom: isMobileLayout ? MAIN_START_ZOOM - 1 : MAIN_START_ZOOM,
          maxZoom: MAIN_MAX_ZOOM,
        };
      }
    }

    await fadeMapBackgroundAfterLoad(mapElement);
  }

  function updateHabitatLayer() {
    const selectedLayerId = getSelectedLayerId();
    const hasSelectedLayer = Boolean(selectedLayerId);

    syncFilterItemDescriptions(selectedLayerId);
    syncResponsiveFilterShell();

    if (selectedLayerId === "habitatAnalysis") {
      habitatAnalysisLayer.rasterFunction = createColormapFunction(
        createHabitatAnalysisFunction(roadThresholds, ruggednessThresholds),
        enablePixelValuesFromColormap(SUITABILITY_COLORMAP, [1, 2]),
      );
    }

    groupLayer.visible = hasSelectedLayer;

    operationalLayers.forEach((layer) => {
      layer.visible = hasSelectedLayer && layer.id === selectedLayerId;
    });
  }

  function applySelectedLayer(layerId) {
    if (getSelectedLayerId() === layerId) {
      return;
    }

    setSelectedLayer(layerId);
    updateHabitatLayer();
  }

  function handleRoadSliderInput() {
    roadThresholds = getSliderRange(distanceToRoadSlider);
    syncRangeStats(
      distanceToRoadSlider,
      distanceToRoadMinStat,
      distanceToRoadMaxStat,
      "px",
    );
    distanceToRoadLayer.rasterFunction = createColormapFunction(
      createRoadFunction(roadThresholds),
      enablePixelValuesFromColormap(SUITABILITY_COLORMAP, [1, 2]),
    );

    if (getSelectedLayerId() === "habitatAnalysis") {
      updateHabitatLayer();
    }
  }

  function handleRuggednessSliderInput() {
    ruggednessThresholds = getSliderRange(terrainRuggednessSlider);
    syncRangeStats(
      terrainRuggednessSlider,
      terrainRuggednessMinStat,
      terrainRuggednessMaxStat,
      "px",
    );
    terrainRuggednessLayer.rasterFunction = createColormapFunction(
      createTerrainRuggednessFunction(ruggednessThresholds),
      enablePixelValuesFromColormap(SUITABILITY_COLORMAP, [1, 2]),
    );

    if (getSelectedLayerId() === "habitatAnalysis") {
      updateHabitatLayer();
    }
  }

  distanceToRoadSlider.addEventListener(
    "calciteSliderInput",
    handleRoadSliderInput,
  );

  terrainRuggednessSlider.addEventListener(
    "calciteSliderInput",
    handleRuggednessSliderInput,
  );

  syncRangeStats(
    distanceToRoadSlider,
    distanceToRoadMinStat,
    distanceToRoadMaxStat,
    "px",
  );
  syncRangeStats(
    terrainRuggednessSlider,
    terrainRuggednessMinStat,
    terrainRuggednessMaxStat,
    "px",
  );

  [distanceToRoadSlider, terrainRuggednessSlider].forEach(
    preserveSliderInteraction,
  );

  mobileFilterActions.forEach((action) => {
    action.addEventListener("click", () => {
      const clickedLayerId = action.dataset.filterId;
      const selectedLayerId =
        clickedLayerId === getSelectedLayerId() ? null : clickedLayerId;

      applySelectedLayer(selectedLayerId);
      focusMobileFilterPanel();
    });
  });

  filterPanel?.addEventListener("calcitePanelClose", () => {
    const selectedLayerId = getSelectedLayerId();

    applySelectedLayer(null);
    focusMobileAction(selectedLayerId);
  });

  filterList.addEventListener("calciteListChange", updateHabitatLayer);

  updateHabitatLayer();
}

void initializeApp().catch((error) => {
  console.error("Error initializing app:", error);
});
