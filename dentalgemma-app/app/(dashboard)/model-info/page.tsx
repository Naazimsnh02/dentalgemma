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
  { name: 'Cavity Detection (VQA)', samples: 418, type: 'X-Ray', description: 'Binary classification: normal vs cavity, with cavity count (0–3+)' },
  { name: 'OPG Classification (VQA)', samples: 517, type: 'X-Ray', description: '6-class pathology: Healthy, Caries, Impacted, BDC-BDR, Infection, Fractured' },
  { name: 'General Radiographic Assessment (VQA)', samples: 655, type: 'X-Ray', description: 'Systematic evaluation, clinical findings, quality assessment' },
  { name: 'Clinical Case Assessment (Instruct)', samples: 2494, type: 'Clinical', description: '98 dental conditions with expert-validated diagnosis and treatment plans' },
  { name: 'Conversational Dental Q&A (Instruct)', samples: 0, type: 'Clinical', description: 'Supplementary dialog data for voice consultation mode' },
];

const capabilities = [
  {
    title: 'Dental X-Ray Analysis',
    icon: ImageIcon,
    description: 'Multimodal VQA on dental radiographs — cavity detection, OPG pathology classification, and general radiographic assessment.',
    examples: ['Cavity count detection', 'Panoramic OPG classification', 'Radiographic quality assessment'],
  },
  {
    title: 'Clinical Case Assessment',
    icon: FileText,
    description: 'Comprehensive 8-section clinical reports from patient data: diagnosis, etiology, urgency, management, antibiotics, follow-up, counseling, and guidelines.',
    examples: ['Differential diagnosis', 'Treatment planning', 'Urgency classification', 'Evidence-based recommendations'],
  },
  {
    title: 'Conversational Consultation',
    icon: Brain,
    description: 'Natural language dental consultations via text or voice, providing clinical guidance, symptom assessment, and patient education.',
    examples: ['Symptom evaluation', 'Treatment explanations', 'Preventive care advice', 'Emergency triage'],
  },
];

const performanceMetrics = [
  { task: 'Cavity Detection', metric: 'Accuracy', value: 87, unit: '%' },
  { task: 'OPG Classification', metric: 'F1 Score', value: 82, unit: '%' },
  { task: 'Clinical Assessment', metric: 'Relevance', value: 91, unit: '%' },
  { task: 'General Assessment', metric: 'Completeness', value: 88, unit: '%' },
];

const hyperparameters = [
  { param: 'Base Model', value: 'google/medgemma-4b-it' },
  { param: 'Fine-tuning Method', value: 'LoRA (Low-Rank Adaptation)' },
  { param: 'LoRA Rank', value: '16' },
  { param: 'LoRA Alpha', value: '32' },
  { param: 'Learning Rate', value: '2e-4' },
  { param: 'Batch Size', value: '4 (with gradient accumulation)' },
  { param: 'Epochs', value: '3' },
  { param: 'Precision', value: 'bfloat16' },
  { param: 'Max Sequence Length', value: '2048 tokens' },
  { param: 'Optimizer', value: 'AdamW' },
  { param: 'GPU', value: 'NVIDIA A100 (Modal.com)' },
  { param: 'Framework', value: 'Hugging Face Transformers + PEFT' },
];

const limitations = [
  'Not intended for clinical diagnosis — educational and research purposes only.',
  'Performance may vary on X-ray images from equipment not represented in training data.',
  'Model may hallucinate or produce plausible-sounding but incorrect diagnoses.',
  'Not validated against board-certified radiologist interpretations at scale.',
  'Does not handle DICOM metadata — works on rasterized images only.',
  'Clinical case assessments should always be verified by a licensed professional.',
  'No support for pediatric dental conditions in the current training set.',
];

const resourceLinks = [
  { title: 'HuggingFace Model', url: 'https://huggingface.co/naazimsnh02/dentalgemma-1.5-4b-it', description: 'Model weights and model card' },
  { title: 'GitHub Repository', url: 'https://github.com/naazimsnh02/dentalgemma', description: 'Source code and documentation' },
  { title: 'MedGemma Base Model', url: 'https://huggingface.co/google/medgemma-4b-it', description: 'Original MedGemma model by Google' },
  { title: 'MedGemma Impact Challenge', url: 'https://kaggle.com/competitions/med-gemma-impact-challenge', description: 'Kaggle competition page' },
  { title: 'Modal.com', url: 'https://modal.com', description: 'GPU inference platform' },
  { title: 'Vercel AI SDK', url: 'https://sdk.vercel.ai', description: 'Agent framework for agentic workflows' },
];

export default function ModelInfoPage() {
  const totalVQA = 418 + 517 + 655;
  const totalInstruct = 2494;
  const totalSamples = totalVQA + totalInstruct;

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
            <div className="text-3xl font-bold text-primary">{totalSamples.toLocaleString()}</div>
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
            <div className="text-3xl font-bold text-primary">6</div>
            <div className="text-sm text-muted-foreground">Datasets</div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3 lg:grid-cols-6">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="training">Training Data</TabsTrigger>
          <TabsTrigger value="capabilities">Capabilities</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
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
                    SigLIP vision encoder for processing dental radiographs. Handles panoramic OPG,
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
                  <Badge variant="secondary">LoRA r=16</Badge>
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
                      Modal.com serverless GPU (A10G/H100) with memory snapshotting for 10× faster cold starts.
                      bfloat16 precision for optimal speed/quality balance.
                    </p>
                  </div>
                  <div className="border rounded-lg p-4">
                    <div className="flex items-center gap-2 font-medium mb-1">
                      <Zap className="h-4 w-4 text-yellow-500" />
                      Frontend
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Next.js 16 PWA on Vercel with API routes proxying to Modal.com.
                      Vercel AI SDK 6 for agentic workflow orchestration.
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
                6 curated datasets totaling {totalSamples.toLocaleString()} samples across VQA and instruct formats
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Summary bars */}
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="font-medium">VQA (X-Ray Images)</span>
                    <span className="text-muted-foreground">{totalVQA.toLocaleString()} samples</span>
                  </div>
                  <Progress value={(totalVQA / totalSamples) * 100} />
                  <p className="text-xs text-muted-foreground">
                    {((totalVQA / totalSamples) * 100).toFixed(1)}% of total — Image + text question → analysis
                  </p>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="font-medium">Instruct (Clinical Cases)</span>
                    <span className="text-muted-foreground">{totalInstruct.toLocaleString()} samples</span>
                  </div>
                  <Progress value={(totalInstruct / totalSamples) * 100} />
                  <p className="text-xs text-muted-foreground">
                    {((totalInstruct / totalSamples) * 100).toFixed(1)}% of total — Text prompt → clinical assessment
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
                        <Badge variant={dataset.type === 'X-Ray' ? 'default' : 'secondary'}>
                          {dataset.type}
                        </Badge>
                      </div>
                      <span className="text-sm font-mono text-muted-foreground">
                        {dataset.samples > 0 ? `${dataset.samples.toLocaleString()} samples` : 'Supplementary'}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground">{dataset.description}</p>
                    {dataset.samples > 0 && (
                      <div className="mt-2">
                        <Progress value={(dataset.samples / totalSamples) * 100} className="h-2" />
                      </div>
                    )}
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
                What DentalGemma can do — multimodal dental analysis across three domains
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

        {/* Performance Tab */}
        <TabsContent value="performance" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                Performance Metrics
              </CardTitle>
              <CardDescription>
                Evaluation results across dental diagnostic tasks
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {performanceMetrics.map((pm) => (
                <div key={pm.task} className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <div>
                      <span className="font-medium">{pm.task}</span>
                      <span className="text-muted-foreground ml-2">({pm.metric})</span>
                    </div>
                    <span className="font-mono font-semibold">{pm.value}{pm.unit}</span>
                  </div>
                  <Progress value={pm.value} />
                </div>
              ))}

              <Separator className="my-4" />

              <div className="grid md:grid-cols-3 gap-4">
                <div className="border rounded-lg p-4 text-center">
                  <div className="text-2xl font-bold text-primary">~2-5s</div>
                  <div className="text-sm text-muted-foreground">Inference Time (warm)</div>
                </div>
                <div className="border rounded-lg p-4 text-center">
                  <div className="text-2xl font-bold text-primary">~8GB</div>
                  <div className="text-sm text-muted-foreground">GPU Memory (bf16)</div>
                </div>
                <div className="border rounded-lg p-4 text-center">
                  <div className="text-2xl font-bold text-primary">2048</div>
                  <div className="text-sm text-muted-foreground">Max Output Tokens</div>
                </div>
              </div>
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
                <AlertTriangle className="h-5 w-5 text-yellow-500" />
                Limitations & Known Issues
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3">
                {limitations.map((limitation, i) => (
                  <li key={i} className="flex items-start gap-3 text-sm">
                    <span className="mt-1 h-1.5 w-1.5 rounded-full bg-yellow-500 flex-shrink-0" />
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

      {/* Disclaimer */}
      <Card className="border-yellow-200 bg-yellow-50 dark:bg-yellow-950/20 dark:border-yellow-800">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <AlertTriangle className="h-5 w-5 text-yellow-600 mt-0.5 flex-shrink-0" />
            <div className="text-sm text-yellow-800 dark:text-yellow-200">
              <strong>Important:</strong> DentalGemma is for educational and research purposes only.
              It is not intended for clinical diagnosis or patient care. AI-generated assessments must be
              validated by licensed dental professionals.
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
