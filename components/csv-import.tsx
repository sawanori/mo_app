'use client';

import { useState, useCallback, useEffect } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, FileText, CheckCircle2, XCircle, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';

type ImportResult = {
  created: number;
  updated: number;
  skipped: number;
  errors: Array<{ row: number; message: string }>;
};

type ImportStatus = 'idle' | 'uploading' | 'success' | 'error';

export function CSVImport() {
  const [file, setFile] = useState<File | null>(null);
  const [status, setStatus] = useState<ImportStatus>('idle');
  const [result, setResult] = useState<ImportResult | null>(null);
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [progress, setProgress] = useState(0);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      const csvFile = acceptedFiles[0];

      // Validate file type
      if (!csvFile.name.endsWith('.csv')) {
        setStatus('error');
        setErrorMessage('ファイルはCSV形式である必要があります');
        return;
      }

      // Validate file size (5MB)
      if (csvFile.size > 5 * 1024 * 1024) {
        setStatus('error');
        setErrorMessage('ファイルサイズは5MB以下である必要があります');
        return;
      }

      setFile(csvFile);
      setStatus('idle');
      setErrorMessage('');
      setResult(null);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'text/csv': ['.csv'],
    },
    maxFiles: 1,
  });

  const handleUpload = async () => {
    if (!file) return;

    setStatus('uploading');
    setProgress(0);
    setErrorMessage('');

    const formData = new FormData();
    formData.append('file', file);

    try {
      // Simulate progress
      const progressInterval = setInterval(() => {
        setProgress((prev) => Math.min(prev + 10, 90));
      }, 200);

      const response = await fetch('/api/import/csv', {
        method: 'POST',
        body: formData,
      });

      clearInterval(progressInterval);
      setProgress(100);

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'インポートに失敗しました');
      }

      const importResult: ImportResult = await response.json();
      setResult(importResult);
      setStatus('success');
      setFile(null);
    } catch (error) {
      console.error('Import error:', error);
      setStatus('error');
      setErrorMessage(error instanceof Error ? error.message : 'インポートに失敗しました');
    }
  };

  const handleReset = () => {
    setFile(null);
    setStatus('idle');
    setResult(null);
    setErrorMessage('');
    setProgress(0);
  };

  if (!mounted) {
    return <div className="p-8 text-center">読み込み中...</div>;
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>メニューCSVインポート</CardTitle>
        <CardDescription>
          CSVファイルをアップロードしてメニューアイテムを一括登録・更新します
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* CSV Format Info */}
        <Alert>
          <FileText className="h-4 w-4" />
          <AlertTitle>CSVフォーマット</AlertTitle>
          <AlertDescription className="text-xs mt-2">
            <div className="font-mono text-[10px] overflow-x-auto">
              main_category,sub_category,item_name,description,price,image,sort_order,is_available,allergens,dietary_tags,card_size,media_type
            </div>
            <div className="mt-2 text-xs">
              <strong>必須:</strong> main_category, sub_category, item_name, description, price, image, sort_order
              <br />
              <strong>オプション:</strong> is_available (1/0, デフォルト: 1), allergens (カンマ区切り), dietary_tags (カンマ区切り), card_size (normal/large), media_type (image/video)
            </div>
          </AlertDescription>
        </Alert>

        {/* Dropzone */}
        {!file && status !== 'uploading' && (
          <div
            {...getRootProps()}
            className={`
              border-2 border-dashed rounded-lg p-8 text-center cursor-pointer
              transition-colors duration-200
              ${isDragActive ? 'border-primary bg-primary/5' : 'border-gray-300 hover:border-primary'}
            `}
          >
            <input {...getInputProps()} />
            <Upload className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            {isDragActive ? (
              <p className="text-sm text-gray-600">ここにドロップしてください...</p>
            ) : (
              <>
                <p className="text-sm text-gray-600 mb-2">
                  CSVファイルをドラッグ＆ドロップ、またはクリックして選択
                </p>
                <p className="text-xs text-gray-500">
                  最大5MB、5000行まで
                </p>
              </>
            )}
          </div>
        )}

        {/* Selected File */}
        {file && status !== 'uploading' && (
          <div className="border rounded-lg p-4 flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <FileText className="h-8 w-8 text-primary" />
              <div>
                <p className="font-medium text-sm">{file.name}</p>
                <p className="text-xs text-gray-500">
                  {(file.size / 1024).toFixed(2)} KB
                </p>
              </div>
            </div>
            <div className="space-x-2">
              <Button onClick={handleUpload} size="sm">
                インポート開始
              </Button>
              <Button onClick={handleReset} variant="outline" size="sm">
                キャンセル
              </Button>
            </div>
          </div>
        )}

        {/* Progress */}
        {status === 'uploading' && (
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span>インポート中...</span>
              <span>{progress}%</span>
            </div>
            <div className="relative h-4 w-full overflow-hidden rounded-full bg-secondary">
              <div
                className="h-full bg-primary transition-all duration-300 ease-in-out"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        )}

        {/* Error Message */}
        {status === 'error' && errorMessage && (
          <Alert variant="destructive">
            <XCircle className="h-4 w-4" />
            <AlertTitle>エラー</AlertTitle>
            <AlertDescription>{errorMessage}</AlertDescription>
          </Alert>
        )}

        {/* Success Result */}
        {status === 'success' && result && (
          <div className="space-y-4">
            <Alert className="border-green-500 bg-green-50">
              <CheckCircle2 className="h-4 w-4 text-green-600" />
              <AlertTitle className="text-green-800">インポート完了</AlertTitle>
              <AlertDescription className="text-green-700">
                CSVファイルのインポートが完了しました
              </AlertDescription>
            </Alert>

            {/* Summary */}
            <div className="grid grid-cols-3 gap-4">
              <Card>
                <CardContent className="pt-6 text-center">
                  <div className="text-2xl font-bold text-green-600">
                    {result.created}
                  </div>
                  <div className="text-xs text-gray-600 mt-1">新規作成</div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6 text-center">
                  <div className="text-2xl font-bold text-blue-600">
                    {result.updated}
                  </div>
                  <div className="text-xs text-gray-600 mt-1">更新</div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6 text-center">
                  <div className="text-2xl font-bold text-gray-600">
                    {result.skipped}
                  </div>
                  <div className="text-xs text-gray-600 mt-1">スキップ</div>
                </CardContent>
              </Card>
            </div>

            {/* Errors */}
            {result.errors.length > 0 && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>
                  エラー詳細 ({result.errors.length}件)
                </AlertTitle>
                <AlertDescription>
                  <ScrollArea className="h-[200px] mt-2">
                    <div className="space-y-2">
                      {result.errors.map((error, index) => (
                        <div
                          key={index}
                          className="text-xs p-2 bg-white rounded border"
                        >
                          <Badge variant="outline" className="mr-2">
                            Row {error.row}
                          </Badge>
                          {error.message}
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                </AlertDescription>
              </Alert>
            )}

            {/* Reset Button */}
            <div className="flex justify-center">
              <Button onClick={handleReset} variant="outline">
                別のファイルをインポート
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
