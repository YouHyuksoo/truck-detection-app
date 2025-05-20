"use client";

import { useCallback, useState } from "react";

// 데이터셋 타입 정의
export interface Dataset {
  id: string;
  name: string;
  images: number;
  annotations: number;
  status: "ready" | "processing" | "error";
  lastUpdated: string;
}

// 하이퍼파라미터 타입 정의
export interface Hyperparameters {
  // 기본 설정
  modelVersion: string;
  modelSize: string;
  epochs: number;
  batchSize: number;
  imageSize: number;

  // 최적화 설정
  learningRate: number;
  weightDecay: number;
  momentum: number;
  useCosineScheduler: boolean;
  warmupEpochs: number;

  // 고급 설정
  iouThreshold: number;
  confThreshold: number;
  useAMP: boolean;
  useEMA: boolean;
  freezeBackbone: boolean;
  freezeBackboneEpochs: number;

  // 파인튜닝 설정
  useFineTuning: boolean;
  pretrainedModel: string;
  freezeLayers: string;
  fineTuningLearningRate: number;
  onlyTrainNewLayers: boolean;
}

// 모델 정보 타입 정의
export interface ModelInfo {
  id: string;
  name: string;
  version: string;
  type: string;
  accuracy: number;
  size: string;
  createdAt: string;
  lastUsed: string;
  status: "active" | "archived" | "training";
  tags: string[];
}

// 트레이닝 메트릭 타입 정의
export interface TrainingMetrics {
  epoch: number;
  loss: number;
  precision: number;
  recall: number;
  mAP: number;
  learningRate: number;
  timestamp: string;
}

// 평가 결과 타입 정의
export interface EvaluationResults {
  mAP50: number;
  mAP50_95: number;
  precision: number;
  recall: number;
  f1Score: number;
  inferenceTime: number;
  confusionMatrix: {
    truePositives: number;
    falsePositives: number;
    falseNegatives: number;
    trueNegatives: number;
  };
  classAccuracy: Record<string, number>;
}

// 테스트 결과 타입 정의
export interface TestResult {
  id: number;
  imageUrl: string;
  predictions: Array<{
    label: string;
    confidence: number;
    bbox: number[];
  }>;
  groundTruth: Array<{
    label: string;
    bbox: number[];
  }>;
  correct: boolean;
}

// 배포 설정 타입 정의
export interface DeploymentSettings {
  modelFormat: string;
  targetDevice: string;
  enableQuantization: boolean;
  quantizationType: string;
  optimizeForInference: boolean;
  deploymentTarget: string;
  modelVersion: string;
  modelName: string;
  includeMetadata: boolean;
}

// 배포된 모델 타입 정의
export interface DeployedModel {
  id: string;
  name: string;
  format: string;
  size: string;
  target: string;
  deployedAt: string;
  status: "active" | "archived";
}

// 모의 데이터 생성 함수
const generateMockData = () => {
  // 데이터셋 모의 데이터
  const mockDatasets: Dataset[] = [
    {
      id: "dataset-1",
      name: "트럭 데이터셋 v1",
      images: 1250,
      annotations: 1250,
      status: "ready",
      lastUpdated: "2023-05-15",
    },
    {
      id: "dataset-2",
      name: "트럭 데이터셋 v2",
      images: 2500,
      annotations: 2350,
      status: "ready",
      lastUpdated: "2023-05-18",
    },
    {
      id: "dataset-3",
      name: "테스트 데이터셋",
      images: 500,
      annotations: 450,
      status: "processing",
      lastUpdated: "2023-05-19",
    },
  ];

  // 하이퍼파라미터 모의 데이터
  const mockHyperparameters: Hyperparameters = {
    modelVersion: "yolov8",
    modelSize: "medium",
    epochs: 100,
    batchSize: 16,
    imageSize: 640,
    learningRate: 0.01,
    weightDecay: 0.0005,
    momentum: 0.937,
    useCosineScheduler: true,
    warmupEpochs: 3,
    iouThreshold: 0.7,
    confThreshold: 0.25,
    useAMP: true,
    useEMA: true,
    freezeBackbone: false,
    freezeBackboneEpochs: 10,
    useFineTuning: false,
    pretrainedModel: "",
    freezeLayers: "backbone",
    fineTuningLearningRate: 0.001,
    onlyTrainNewLayers: false,
  };

  // 모델 정보 모의 데이터
  const mockModels: ModelInfo[] = [
    {
      id: "model-1",
      name: "YOLOv8m 기본 모델",
      version: "v8.0.0",
      type: "pretrained",
      accuracy: 89.5,
      size: "78.5MB",
      createdAt: "2023-01-15",
      lastUsed: "2023-05-10",
      status: "active",
      tags: ["기본", "공식"],
    },
    {
      id: "model-2",
      name: "트럭 감지 모델 v1",
      version: "1.0.0",
      type: "custom",
      accuracy: 92.3,
      size: "82.1MB",
      createdAt: "2023-04-15",
      lastUsed: "2023-05-18",
      status: "archived",
      tags: ["트럭", "커스텀"],
    },
    {
      id: "model-3",
      name: "트럭 감지 모델 v2",
      version: "2.0.0",
      type: "custom",
      accuracy: 94.7,
      size: "85.3MB",
      createdAt: "2023-06-22",
      lastUsed: "2023-09-05",
      status: "active",
      tags: ["트럭", "커스텀", "최적화"],
    },
    {
      id: "model-4",
      name: "트럭 감지 모델 v3",
      version: "3.0.0",
      type: "finetuned",
      accuracy: 96.2,
      size: "86.7MB",
      createdAt: "2023-09-10",
      lastUsed: "2023-09-10",
      status: "active",
      tags: ["트럭", "파인튜닝", "야간"],
    },
  ];

  // 평가 결과 모의 데이터
  const mockEvaluationResults: EvaluationResults = {
    mAP50: 0.892,
    mAP50_95: 0.724,
    precision: 0.875,
    recall: 0.831,
    f1Score: 0.852,
    inferenceTime: 23.4,
    confusionMatrix: {
      truePositives: 245,
      falsePositives: 35,
      falseNegatives: 50,
      trueNegatives: 670,
    },
    classAccuracy: {
      트럭: 0.92,
      버스: 0.87,
      승용차: 0.95,
      오토바이: 0.83,
    },
  };

  // 테스트 결과 모의 데이터
  const mockTestResults: TestResult[] = [
    {
      id: 1,
      imageUrl: "/truck-detection-1.png",
      predictions: [
        { label: "트럭", confidence: 0.95, bbox: [50, 100, 200, 150] },
      ],
      groundTruth: [{ label: "트럭", bbox: [45, 95, 210, 155] }],
      correct: true,
    },
    {
      id: 2,
      imageUrl: "/truck-detection-2.png",
      predictions: [
        { label: "트럭", confidence: 0.87, bbox: [150, 120, 180, 140] },
      ],
      groundTruth: [{ label: "트럭", bbox: [145, 115, 185, 145] }],
      correct: true,
    },
    {
      id: 3,
      imageUrl: "/truck-detection-3.png",
      predictions: [
        { label: "버스", confidence: 0.72, bbox: [80, 110, 220, 160] },
      ],
      groundTruth: [{ label: "트럭", bbox: [75, 105, 225, 165] }],
      correct: false,
    },
    {
      id: 4,
      imageUrl: "/truck-detection-4.png",
      predictions: [],
      groundTruth: [{ label: "트럭", bbox: [120, 90, 180, 130] }],
      correct: false,
    },
  ];

  // 배포 설정 모의 데이터
  const mockDeploymentSettings: DeploymentSettings = {
    modelFormat: "onnx",
    targetDevice: "gpu",
    enableQuantization: true,
    quantizationType: "int8",
    optimizeForInference: true,
    deploymentTarget: "edge",
    modelVersion: "1.0.0",
    modelName: "truck_detector_yolov8m",
    includeMetadata: true,
  };

  // 배포된 모델 모의 데이터
  const mockDeployedModels: DeployedModel[] = [
    {
      id: "model-1",
      name: "truck_detector_yolov8m_v1.0.0",
      format: "ONNX",
      size: "21.6 MB",
      target: "Edge Device",
      deployedAt: "2023-05-15 14:30:22",
      status: "active",
    },
    {
      id: "model-2",
      name: "truck_detector_yolov8s_v0.9.5",
      format: "TensorRT",
      size: "12.8 MB",
      target: "Edge Device",
      deployedAt: "2023-05-10 09:15:47",
      status: "archived",
    },
  ];

  return {
    datasets: mockDatasets,
    hyperparameters: mockHyperparameters,
    models: mockModels,
    evaluationResults: mockEvaluationResults,
    testResults: mockTestResults,
    deploymentSettings: mockDeploymentSettings,
    deployedModels: mockDeployedModels,
  };
};

// API 함수 구현
const isMockEnabled = process.env.NEXT_PUBLIC_MOCK_API === "true";
const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8010/api";

// 데이터셋 API 함수
export const getDatasets = async (): Promise<Dataset[]> => {
  if (isMockEnabled) {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(generateMockData().datasets);
      }, 500);
    });
  }

  const response = await fetch(`${API_BASE_URL}/training/datasets`);
  if (!response.ok) {
    throw new Error("Failed to fetch datasets");
  }
  return response.json();
};

export const uploadDataset = async (formData: FormData): Promise<Dataset> => {
  if (isMockEnabled) {
    return new Promise((resolve) => {
      setTimeout(() => {
        const newDataset: Dataset = {
          id: `dataset-${Date.now()}`,
          name: `새 데이터셋 ${new Date().toLocaleDateString()}`,
          images: Math.floor(Math.random() * 1000) + 500,
          annotations: Math.floor(Math.random() * 900) + 400,
          status: "ready",
          lastUpdated: new Date().toISOString().split("T")[0],
        };
        resolve(newDataset);
      }, 1500);
    });
  }

  const response = await fetch(`${API_BASE_URL}/training/datasets/upload`, {
    method: "POST",
    body: formData,
  });
  if (!response.ok) {
    throw new Error("Failed to upload dataset");
  }
  return response.json();
};

export const deleteDataset = async (datasetId: string): Promise<void> => {
  if (isMockEnabled) {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve();
      }, 500);
    });
  }

  const response = await fetch(
    `${API_BASE_URL}/training/datasets/${datasetId}`,
    {
      method: "DELETE",
    }
  );
  if (!response.ok) {
    throw new Error("Failed to delete dataset");
  }
};

// 하이퍼파라미터 API 함수
export const getHyperparameters = async (): Promise<Hyperparameters> => {
  if (isMockEnabled) {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(generateMockData().hyperparameters);
      }, 500);
    });
  }

  const response = await fetch(`${API_BASE_URL}/training/hyperparameters`);
  if (!response.ok) {
    throw new Error("Failed to fetch hyperparameters");
  }
  return response.json();
};

export const updateHyperparameters = async (
  hyperparameters: Hyperparameters
): Promise<Hyperparameters> => {
  if (isMockEnabled) {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(hyperparameters);
      }, 500);
    });
  }

  const response = await fetch(`${API_BASE_URL}/training/hyperparameters`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(hyperparameters),
  });
  if (!response.ok) {
    throw new Error("Failed to update hyperparameters");
  }
  return response.json();
};

// 모델 API 함수
export const getModels = async (): Promise<ModelInfo[]> => {
  if (isMockEnabled) {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(generateMockData().models);
      }, 500);
    });
  }

  const response = await fetch(`${API_BASE_URL}/training/models`);
  if (!response.ok) {
    throw new Error("Failed to fetch models");
  }
  return response.json();
};

export const getModelById = async (modelId: string): Promise<ModelInfo> => {
  if (isMockEnabled) {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const model = generateMockData().models.find((m) => m.id === modelId);
        if (model) {
          resolve(model);
        } else {
          reject(new Error("Model not found"));
        }
      }, 500);
    });
  }

  const response = await fetch(`${API_BASE_URL}/training/models/${modelId}`);
  if (!response.ok) {
    throw new Error("Failed to fetch model");
  }
  return response.json();
};

// 트레이닝 API 함수
export const startTraining = async (
  datasetId: string,
  modelId: string | null,
  hyperparameters: Hyperparameters
): Promise<{ trainingId: string }> => {
  if (isMockEnabled) {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({ trainingId: `training-${Date.now()}` });
      }, 1000);
    });
  }

  const response = await fetch(`${API_BASE_URL}/training/start`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      datasetId,
      modelId,
      hyperparameters,
    }),
  });
  if (!response.ok) {
    throw new Error("Failed to start training");
  }
  return response.json();
};

export const stopTraining = async (trainingId: string): Promise<void> => {
  if (isMockEnabled) {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve();
      }, 500);
    });
  }

  const response = await fetch(`${API_BASE_URL}/training/stop/${trainingId}`, {
    method: "POST",
  });
  if (!response.ok) {
    throw new Error("Failed to stop training");
  }
};

export const getTrainingMetrics = async (
  trainingId: string
): Promise<TrainingMetrics[]> => {
  if (isMockEnabled) {
    return new Promise((resolve) => {
      setTimeout(() => {
        const metrics: TrainingMetrics[] = [];
        const numEpochs = Math.floor(Math.random() * 50) + 1;

        for (let epoch = 1; epoch <= numEpochs; epoch++) {
          metrics.push({
            epoch,
            loss: 5 / (1 + 0.1 * epoch) + Math.random() * 0.2,
            precision:
              0.5 + 0.4 * (1 - Math.exp(-0.05 * epoch)) + Math.random() * 0.05,
            recall:
              0.5 + 0.4 * (1 - Math.exp(-0.05 * epoch)) + Math.random() * 0.05,
            mAP:
              0.4 + 0.5 * (1 - Math.exp(-0.03 * epoch)) + Math.random() * 0.03,
            learningRate: 0.01 * Math.cos(((epoch / 100) * Math.PI) / 2),
            timestamp: new Date().toISOString(),
          });
        }

        resolve(metrics);
      }, 500);
    });
  }

  const response = await fetch(
    `${API_BASE_URL}/training/metrics/${trainingId}`
  );
  if (!response.ok) {
    throw new Error("Failed to fetch training metrics");
  }
  return response.json();
};

export const getTrainingLogs = async (
  trainingId: string
): Promise<string[]> => {
  if (isMockEnabled) {
    return new Promise((resolve) => {
      setTimeout(() => {
        const logs: string[] = [];
        const numEpochs = Math.floor(Math.random() * 50) + 1;

        for (let epoch = 1; epoch <= numEpochs; epoch++) {
          const loss = 5 / (1 + 0.1 * epoch) + Math.random() * 0.2;
          const precision =
            0.5 + 0.4 * (1 - Math.exp(-0.05 * epoch)) + Math.random() * 0.05;
          const recall =
            0.5 + 0.4 * (1 - Math.exp(-0.05 * epoch)) + Math.random() * 0.05;
          const mAP =
            0.4 + 0.5 * (1 - Math.exp(-0.03 * epoch)) + Math.random() * 0.03;
          const learningRate = 0.01 * Math.cos(((epoch / 100) * Math.PI) / 2);

          logs.push(`[${epoch}] Epoch ${epoch}/100, Loss: ${loss.toFixed(4)}`);
          logs.push(
            `[${epoch}] Precision: ${precision.toFixed(
              4
            )}, Recall: ${recall.toFixed(4)}`
          );
          logs.push(
            `[${epoch}] mAP@0.5: ${mAP.toFixed(4)}, LR: ${learningRate.toFixed(
              6
            )}`
          );
        }

        resolve(logs);
      }, 500);
    });
  }

  const response = await fetch(`${API_BASE_URL}/training/logs/${trainingId}`);
  if (!response.ok) {
    throw new Error("Failed to fetch training logs");
  }
  return response.json();
};

// 평가 API 함수
export const evaluateModel = async (
  modelId: string
): Promise<EvaluationResults> => {
  if (isMockEnabled) {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(generateMockData().evaluationResults);
      }, 2000);
    });
  }

  const response = await fetch(`${API_BASE_URL}/training/evaluate/${modelId}`, {
    method: "POST",
  });
  if (!response.ok) {
    throw new Error("Failed to evaluate model");
  }
  return response.json();
};

export const getTestResults = async (
  modelId: string
): Promise<TestResult[]> => {
  if (isMockEnabled) {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(generateMockData().testResults);
      }, 500);
    });
  }

  const response = await fetch(
    `${API_BASE_URL}/training/test-results/${modelId}`
  );
  if (!response.ok) {
    throw new Error("Failed to fetch test results");
  }
  return response.json();
};

// 배포 API 함수
export const getDeploymentSettings = async (): Promise<DeploymentSettings> => {
  if (isMockEnabled) {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(generateMockData().deploymentSettings);
      }, 500);
    });
  }

  const response = await fetch(`${API_BASE_URL}/training/deployment/settings`);
  if (!response.ok) {
    throw new Error("Failed to fetch deployment settings");
  }
  return response.json();
};

export const updateDeploymentSettings = async (
  settings: DeploymentSettings
): Promise<DeploymentSettings> => {
  if (isMockEnabled) {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(settings);
      }, 500);
    });
  }

  const response = await fetch(`${API_BASE_URL}/training/deployment/settings`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(settings),
  });
  if (!response.ok) {
    throw new Error("Failed to update deployment settings");
  }
  return response.json();
};

export const deployModel = async (
  modelId: string,
  settings: DeploymentSettings
): Promise<{ deploymentId: string }> => {
  if (isMockEnabled) {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({ deploymentId: `deployment-${Date.now()}` });
      }, 2000);
    });
  }

  const response = await fetch(`${API_BASE_URL}/training/deploy/${modelId}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(settings),
  });
  if (!response.ok) {
    throw new Error("Failed to deploy model");
  }
  return response.json();
};

export const getDeployedModels = async (): Promise<DeployedModel[]> => {
  if (isMockEnabled) {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(generateMockData().deployedModels);
      }, 500);
    });
  }

  const response = await fetch(`${API_BASE_URL}/training/deployed-models`);
  if (!response.ok) {
    throw new Error("Failed to fetch deployed models");
  }
  return response.json();
};

// 훅 구현
export const useTrainingApi = () => {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // 데이터셋 관련 상태 및 함수
  const [datasets, setDatasets] = useState<Dataset[]>([]);
  const [selectedDataset, setSelectedDataset] = useState<string>("");

  // 하이퍼파라미터 관련 상태 및 함수
  const [hyperparameters, setHyperparameters] =
    useState<Hyperparameters | null>(null);

  // 모델 관련 상태 및 함수
  const [models, setModels] = useState<ModelInfo[]>([]);
  const [selectedModel, setSelectedModel] = useState<string>("");

  // 트레이닝 관련 상태 및 함수
  const [isTraining, setIsTraining] = useState<boolean>(false);
  const [trainingProgress, setTrainingProgress] = useState<number>(0);
  const [trainingId, setTrainingId] = useState<string | null>(null);
  const [trainingMetrics, setTrainingMetrics] = useState<TrainingMetrics[]>([]);
  const [trainingLogs, setTrainingLogs] = useState<string[]>([]);

  // 평가 관련 상태 및 함수
  const [evaluationResults, setEvaluationResults] =
    useState<EvaluationResults | null>(null);
  const [testResults, setTestResults] = useState<TestResult[]>([]);
  const [isEvaluating, setIsEvaluating] = useState<boolean>(false);

  // 배포 관련 상태 및 함수
  const [deploymentSettings, setDeploymentSettings] =
    useState<DeploymentSettings | null>(null);
  const [deployedModels, setDeployedModels] = useState<DeployedModel[]>([]);
  const [isDeploying, setIsDeploying] = useState<boolean>(false);

  // 데이터셋 로드
  const loadDatasets = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await getDatasets();
      setDatasets(data);
      if (data.length > 0 && !selectedDataset) {
        setSelectedDataset(data[0].id);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load datasets");
    } finally {
      setIsLoading(false);
    }
  }, [selectedDataset]);

  // 데이터셋 업로드
  const handleUploadDataset = useCallback(async (formData: FormData) => {
    setIsLoading(true);
    setError(null);
    try {
      const newDataset = await uploadDataset(formData);
      setDatasets((prev) => [...prev, newDataset]);
      return newDataset;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to upload dataset");
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // 데이터셋 삭제
  const handleDeleteDataset = useCallback(
    async (datasetId: string) => {
      setIsLoading(true);
      setError(null);
      try {
        await deleteDataset(datasetId);
        setDatasets((prev) =>
          prev.filter((dataset) => dataset.id !== datasetId)
        );
        if (selectedDataset === datasetId) {
          const remainingDatasets = datasets.filter((d) => d.id !== datasetId);
          setSelectedDataset(
            remainingDatasets.length > 0 ? remainingDatasets[0].id : ""
          );
        }
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to delete dataset"
        );
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    [datasets, selectedDataset]
  );

  // 하이퍼파라미터 로드
  const loadHyperparameters = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await getHyperparameters();
      setHyperparameters(data);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to load hyperparameters"
      );
    } finally {
      setIsLoading(false);
    }
  }, []);

  // 하이퍼파라미터 업데이트
  const handleUpdateHyperparameters = useCallback(
    async (params: Hyperparameters) => {
      setIsLoading(true);
      setError(null);
      try {
        const updatedParams = await updateHyperparameters(params);
        setHyperparameters(updatedParams);
        return updatedParams;
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "Failed to update hyperparameters"
        );
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  // 모델 로드
  const loadModels = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await getModels();
      setModels(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load models");
    } finally {
      setIsLoading(false);
    }
  }, []);

  // 모델 선택
  const handleSelectModel = useCallback((modelId: string) => {
    setSelectedModel(modelId);
  }, []);

  // 트레이닝 시작
  const handleStartTraining = useCallback(
    async (
      datasetId: string,
      modelId: string | null,
      params: Hyperparameters
    ) => {
      setIsLoading(true);
      setError(null);
      try {
        const { trainingId } = await startTraining(datasetId, modelId, params);
        setTrainingId(trainingId);
        setIsTraining(true);
        setTrainingProgress(0);
        return trainingId;
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to start training"
        );
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  // 트레이닝 중지
  const handleStopTraining = useCallback(async () => {
    if (!trainingId) return;

    setIsLoading(true);
    setError(null);
    try {
      await stopTraining(trainingId);
      setIsTraining(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to stop training");
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [trainingId]);

  // 트레이닝 메트릭 로드
  const loadTrainingMetrics = useCallback(async () => {
    if (!trainingId) return;

    setIsLoading(true);
    setError(null);
    try {
      const metrics = await getTrainingMetrics(trainingId);
      setTrainingMetrics(metrics);
      // 진행률 계산 (에폭 기준)
      if (hyperparameters && metrics.length > 0) {
        const progress = (metrics.length / hyperparameters.epochs) * 100;
        setTrainingProgress(Math.min(progress, 100));
      }
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to load training metrics"
      );
    } finally {
      setIsLoading(false);
    }
  }, [trainingId, hyperparameters]);

  // 트레이닝 로그 로드
  const loadTrainingLogs = useCallback(async () => {
    if (!trainingId) return;

    setIsLoading(true);
    setError(null);
    try {
      const logs = await getTrainingLogs(trainingId);
      setTrainingLogs(logs);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to load training logs"
      );
    } finally {
      setIsLoading(false);
    }
  }, [trainingId]);

  // 모델 평가
  const handleEvaluateModel = useCallback(async (modelId: string) => {
    setIsLoading(true);
    setError(null);
    setIsEvaluating(true);
    try {
      const results = await evaluateModel(modelId);
      setEvaluationResults(results);
      return results;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to evaluate model");
      throw err;
    } finally {
      setIsLoading(false);
      setIsEvaluating(false);
    }
  }, []);

  // 테스트 결과 로드
  const loadTestResults = useCallback(async (modelId: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const results = await getTestResults(modelId);
      setTestResults(results);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to load test results"
      );
    } finally {
      setIsLoading(false);
    }
  }, []);

  // 배포 설정 로드
  const loadDeploymentSettings = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const settings = await getDeploymentSettings();
      setDeploymentSettings(settings);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to load deployment settings"
      );
    } finally {
      setIsLoading(false);
    }
  }, []);

  // 배포 설정 업데이트
  const handleUpdateDeploymentSettings = useCallback(
    async (settings: DeploymentSettings) => {
      setIsLoading(true);
      setError(null);
      try {
        const updatedSettings = await updateDeploymentSettings(settings);
        setDeploymentSettings(updatedSettings);
        return updatedSettings;
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "Failed to update deployment settings"
        );
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  // 모델 배포
  const handleDeployModel = useCallback(
    async (modelId: string, settings: DeploymentSettings) => {
      setIsLoading(true);
      setError(null);
      setIsDeploying(true);
      try {
        const { deploymentId } = await deployModel(modelId, settings);
        await loadDeployedModels();
        return deploymentId;
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to deploy model");
        throw err;
      } finally {
        setIsLoading(false);
        setIsDeploying(false);
      }
    },
    []
  );

  // 배포된 모델 로드
  const loadDeployedModels = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const models = await getDeployedModels();
      setDeployedModels(models);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to load deployed models"
      );
    } finally {
      setIsLoading(false);
    }
  }, []);

  // 모의 트레이닝 진행 시뮬레이션
  const simulateTrainingProgress = useCallback(() => {
    if (!isTraining) return;

    const interval = setInterval(() => {
      setTrainingProgress((prev) => {
        const newProgress = prev + Math.random() * 5;
        if (newProgress >= 100) {
          clearInterval(interval);
          setIsTraining(false);
          return 100;
        }
        return newProgress;
      });
    }, 3000);

    return () => clearInterval(interval);
  }, [isTraining]);

  return {
    // 상태
    isLoading,
    error,
    datasets,
    selectedDataset,
    hyperparameters,
    models,
    selectedModel,
    isTraining,
    trainingProgress,
    trainingId,
    trainingMetrics,
    trainingLogs,
    evaluationResults,
    testResults,
    isEvaluating,
    deploymentSettings,
    deployedModels,
    isDeploying,

    // 데이터셋 함수
    loadDatasets,
    handleUploadDataset,
    handleDeleteDataset,
    setSelectedDataset,

    // 하이퍼파라미터 함수
    loadHyperparameters,
    handleUpdateHyperparameters,

    // 모델 함수
    loadModels,
    handleSelectModel,

    // 트레이닝 함수
    handleStartTraining,
    handleStopTraining,
    loadTrainingMetrics,
    loadTrainingLogs,
    simulateTrainingProgress,

    // 평가 함수
    handleEvaluateModel,
    loadTestResults,

    // 배포 함수
    loadDeploymentSettings,
    handleUpdateDeploymentSettings,
    handleDeployModel,
    loadDeployedModels,
  };
};
