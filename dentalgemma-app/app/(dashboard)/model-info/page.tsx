'use client';

/**
 * About DentalGemma Model Page
 *
 * Displays model architecture, training data, capabilities,
 * performance metrics, technical details, and resource links.
 * Requirements: 11.1-11.10
 */

import {
  Info,
  Brain,
  Database,
  Zap,
  BarChart3,
  Settings2,
  ExternalLink,
  Image as ImageIcon,
  FileText,
  AlertTriangle,
  Cpu,
  Layers,
  GitBranch,
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const trainingDatasets = [
  { name: 'Clinical Photo Analysis (VQA)', samples: 642, type: 'Photo', description: 'Binary classification (cavity/normal) & severity assessment with compositional clinical descriptions' },
  { name: 'OPG Classification (VQA)', samples: 1214, type: 'X-Ray', description: '6-class pathology: Healthy, Caries, Impacted, BDC-BDR, Infection, Fractured' },
  { name: 'OPG Object Detection (VQA)', samples: 545, type: 'X-Ray', description: 'Location-aware diagnosis with region mapping (e.g., "right mandibular region")' },
  { name: 'Panoramic Dentition (VQA)', samples: 128, type: 'X-Ray', description: 'Dentition completeness, tooth type identification, and anatomical overview' },
  { name: 'Clinical Case Assessment (Instruct)', samples: 2494, type: 'Clinical', description: '98 dental conditions with comprehensive structured assessments (diagnosis, plan, counseling)' },
];

const capabilities = [
  {
    title: 'Dental Image Analysis',
    icon: ImageIcon,
    description: 'Multimodal VQA on dental images — cavity detection (photos) and panoramic OPG analysis including pathology classification and object detection.',
    examples: ['Cavity photo detection', 'Panoramic pathology classification', 'Location-aware diagnosis', 'Dentition assessment'],
  },
  {
    title: 'Clinical Case Assessment',
    icon: FileText,
    description: 'Comprehensive structured clinical reports: diagnosis, management plan, antibiotic considerations, follow-up, and patient counseling for 98 conditions.',
    examples: ['Differential diagnosis', 'Treatment planning', 'Urgency classification', 'Evidence-based recommendations'],
  },
  {
    title: 'Conversational Consultation',
    icon: Brain,
    description: 'Natural language dental consultations via text or voice, providing clinical guidance based on patient demographics and symptoms.',
    examples: ['Symptom evaluation', 'Treatment explanations', 'Preventive care advice', 'Emergency triage'],
  },
];

const hyperparameters = [
  { param: 'Base Model', value: 'google/medgemma-1.5-4b-it' },
  { param: 'Fine-tuning Method', value: 'LoRA (Full bfloat16)' },
  { param: 'LoRA Rank', value: '64' },
  { param: 'LoRA Alpha', value: '64' },
  { param: 'Learning Rate', value: '5e-5' },
  { param: 'Batch Size', value: '4 (gradient accumulation)' },
  { param: 'Epochs', value: '~4-5 (Converged)' },
  { param: 'Precision', value: 'bfloat16 (No quantization)' },
  { param: 'Max Sequence Length', value: '1024 tokens' },
  { param: 'Optimizer', value: 'AdamW (Fused)' },
  { param: 'GPU', value: 'NVIDIA A100 (80GB)' },
  { param: 'Framework', value: 'Hugging Face Transformers + PEFT' },
];

const limitations = [
  'Not intended for clinical diagnosis — educational and research purposes only.',
  'Performance may vary on X-ray images from equipment not represented in training data.',
  'Model may hallucinate or produce plausible-sounding but incorrect diagnoses.',
  'Not validated against board-certified radiologist interpretations at scale.',
  'Does not handle DICOM metadata — works on rasterized images only.',
  'Clinical case assessments should always be verified by a licensed professional.',
  'Location accuracy from bounding boxes is approximate.',
];

const resourceLinks = [
  { title: 'HuggingFace Model', url: 'https://huggingface.co/naazimsnh02/dentalgemma-1.5-4b-it', description: 'Model weights and model card' },
  { title: 'GitHub Repository', url: 'https://github.com/naazimsnh02/dentalgemma', description: 'Source code and documentation' },
  { title: 'MedGemma Base Model', url: 'https://huggingface.co/google/medgemma-1.5-4b-it', description: 'Original MedGemma model by Google' },
  { title: 'MedGemma Impact Challenge', url: 'https://kaggle.com/competitions/med-gemma-impact-challenge', description: 'Kaggle competition page' },
  { title: 'Modal.com', url: 'https://modal.com', description: 'GPU inference platform' },
];

export default function ModelInfoPage() {
  const totalSamples = 5023; // 2529 VQA + 2494 Instruct

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="flex items-start gap-4">
        <div className="p-3 bg-primary rounded-lg">
          <Info className="h-7 w-7 text-primary-foreground" />
        </div>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">About DentalGemma</h1>
          <p className="text-muted-foreground mt-1">
            Fine-tuned MedGemma 1.5 4B IT for dental diagnostics — architecture, training data, and capabilities
          </p>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-3xl font-bold text-primary">4B</div>
            <div className="text-sm text-muted-foreground">Parameters</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-3xl font-bold text-primary">5k+</div>
            <div className="text-sm text-muted-foreground">Training Samples</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-3xl font-bold text-primary">98</div>
            <div className="text-sm text-muted-foreground">Dental Conditions</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-3xl font-bold text-primary">5</div>
            <div className="text-sm text-muted-foreground">Datasets</div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3 lg:grid-cols-5">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="training">Training Data</TabsTrigger>
          <TabsTrigger value="capabilities">Capabilities</TabsTrigger>
          <TabsTrigger value="technical">Technical</TabsTrigger>
          <TabsTrigger value="resources">Resources</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Brain className="h-5 w-5" />
                Model Architecture
              </CardTitle>
              <CardDescription>
                DentalGemma is built on Google&apos;s MedGemma foundation, fine-tuned for dental diagnostics
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid md:grid-cols-3 gap-4">
                <div className="border rounded-lg p-4 space-y-2">
                  <div className="flex items-center gap-2 font-semibold">
                    <Layers className="h-4 w-4 text-blue-500" />
                    Base Model
                  </div>
                  <p className="text-sm text-muted-foreground">
                    MedGemma 1.5 4B IT — Google&apos;s medical foundation model based on Gemma 3,
                    pre-trained on medical literature, clinical notes, and biomedical images.
                  </p>
                  <Badge variant="secondary">4B parameters</Badge>
                </div>
                <div className="border rounded-lg p-4 space-y-2">
                  <div className="flex items-center gap-2 font-semibold">
                    <ImageIcon className="h-4 w-4 text-green-500" />
                    Vision Encoder
                  </div>
                  <p className="text-sm text-muted-foreground">
                    SigLIP vision encoder for processing dental images. Handles clinical photos, panoramic OPG,
                    periapical, and bitewing X-ray formats.
                  </p>
                  <Badge variant="secondary">Multimodal</Badge>
                </div>
                <div className="border rounded-lg p-4 space-y-2">
                  <div className="flex items-center gap-2 font-semibold">
                    <GitBranch className="h-4 w-4 text-purple-500" />
                    Fine-tuning
                  </div>
                  <p className="text-sm text-muted-foreground">
                    LoRA (Low-Rank Adaptation) fine-tuning preserves the base model&apos;s medical knowledge
                    while adapting to dental-specific tasks.
                  </p>
                  <Badge variant="secondary">LoRA r=64</Badge>
                </div>
              </div>

              <Separator />

              <div>
                <h4 className="font-semibold mb-3">Why Dental Diagnostics?</h4>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  MedGemma was not originally trained on dental-specific data — making dental diagnostics
                  a <strong>novel task adaptation</strong>. DentalGemma demonstrates that MedGemma&apos;s
                  medical foundation can be successfully extended to specialized domains through targeted
                  fine-tuning on curated dental datasets. This approach addresses the global shortage of
                  dental specialists and enables faster, more accessible preliminary screening.
                </p>
              </div>

              <div>
                <h4 className="font-semibold mb-3">Deployment Architecture</h4>
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="border rounded-lg p-4">
                    <div className="flex items-center gap-2 font-medium mb-1">
                      <Cpu className="h-4 w-4 text-orange-500" />
                      Inference Backend
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Modal.com serverless GPU (L40S) with memory snapshotting for 10× faster cold starts.
                      bfloat16 precision for optimal speed/quality balance.
                    </p>
                  </div>
                  <div className="border rounded-lg p-4">
                    <div className="flex items-center gap-2 font-medium mb-1">
                      <Zap className="h-4 w-4 text-amber-500" />
                      Frontend
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Next.js 16 on Vercel with API routes proxying to Modal.com.
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Training Data Tab */}
        <TabsContent value="training" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Database className="h-5 w-5" />
                Training Datasets
              </CardTitle>
              <CardDescription>
                5 curated datasets totaling {totalSamples.toLocaleString()} samples across VQA and instruct formats
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Summary bars */}
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="font-medium">VQA (X-Ray & Photo)</span>
                    <span className="text-muted-foreground">2,529 samples</span>
                  </div>
                  <Progress value={(2529 / totalSamples) * 100} />
                  <p className="text-xs text-muted-foreground">
                    {((2529 / totalSamples) * 100).toFixed(1)}% of total — Image + text question → analysis
                  </p>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="font-medium">Instruct (Clinical Cases)</span>
                    <span className="text-muted-foreground">2,494 samples</span>
                  </div>
                  <Progress value={(2494 / totalSamples) * 100} />
                  <p className="text-xs text-muted-foreground">
                    {((2494 / totalSamples) * 100).toFixed(1)}% of total — Text prompt → clinical assessment
                  </p>
                </div>
              </div>

              <Separator />

              {/* Dataset breakdown */}
              <div className="space-y-3">
                {trainingDatasets.map((dataset) => (
                  <div key={dataset.name} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-sm">{dataset.name}</span>
                        <Badge variant={dataset.type === 'X-Ray' ? 'default' : dataset.type === 'Photo' ? 'secondary' : 'outline'}>
                          {dataset.type}
                        </Badge>
                      </div>
                      <span className="text-sm font-mono text-muted-foreground">
                        {dataset.samples.toLocaleString()} samples
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground">{dataset.description}</p>
                    <div className="mt-2">
                      <Progress value={(dataset.samples / totalSamples) * 100} className="h-2" />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Capabilities Tab */}
        <TabsContent value="capabilities" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="h-5 w-5" />
                Model Capabilities
              </CardTitle>
              <CardDescription>
                What DentalGemma can do — multimodal dental analysis across photography, radiography, and text
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {capabilities.map((cap) => {
                const Icon = cap.icon;
                return (
                  <div key={cap.title} className="border rounded-lg p-5">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="p-2 bg-primary/10 rounded-lg">
                        <Icon className="h-5 w-5 text-primary" />
                      </div>
                      <h4 className="font-semibold text-lg">{cap.title}</h4>
                    </div>
                    <p className="text-sm text-muted-foreground mb-3">{cap.description}</p>
                    <div className="flex flex-wrap gap-2">
                      {cap.examples.map((example) => (
                        <Badge key={example} variant="outline">{example}</Badge>
                      ))}
                    </div>
                  </div>
                );
              })}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Technical Tab */}
        <TabsContent value="technical" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings2 className="h-5 w-5" />
                Training Hyperparameters
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-x-8 gap-y-2">
                {hyperparameters.map((hp) => (
                  <div key={hp.param} className="flex justify-between py-2 border-b last:border-b-0">
                    <span className="text-sm text-muted-foreground">{hp.param}</span>
                    <span className="text-sm font-mono font-medium">{hp.value}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-amber-600" />
                Limitations & Known Issues
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3">
                {limitations.map((limitation, i) => (
                  <li key={i} className="flex items-start gap-3 text-sm">
                    <span className="mt-1 h-1.5 w-1.5 rounded-full bg-amber-500 flex-shrink-0" />
                    <span className="text-muted-foreground">{limitation}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Resources Tab */}
        <TabsContent value="resources" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ExternalLink className="h-5 w-5" />
                Links & Resources
              </CardTitle>
              <CardDescription>
                Access the model, datasets, and related project resources
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-4">
                {resourceLinks.map((link) => (
                  <a
                    key={link.title}
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="border rounded-lg p-4 hover:border-primary/50 hover:shadow-sm transition-all group"
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-medium group-hover:text-primary transition-colors">
                        {link.title}
                      </span>
                      <ExternalLink className="h-3.5 w-3.5 text-muted-foreground" />
                    </div>
                    <p className="text-sm text-muted-foreground">{link.description}</p>
                  </a>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Model Card</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-sm">
              <div className="grid md:grid-cols-2 gap-x-8 gap-y-2">
                {[
                  ['Model Name', 'dentalgemma-1.5-4b-it'],
                  ['Developer', 'naazimsnh02'],
                  ['Base Model', 'google/medgemma-4b-it'],
                  ['Model Type', 'Multimodal (Vision + Language)'],
                  ['License', 'Apache 2.0 (inherited from Gemma)'],
                  ['Language', 'English'],
                  ['Domain', 'Dental Diagnostics'],
                  ['Task Type', 'VQA + Instruction Following'],
                ].map(([label, value]) => (
                  <div key={label} className="flex justify-between py-2 border-b last:border-b-0">
                    <span className="text-muted-foreground">{label}</span>
                    <span className="font-mono font-medium">{value}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
