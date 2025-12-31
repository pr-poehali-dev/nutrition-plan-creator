import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import Icon from '@/components/ui/icon';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';

interface Dish {
  id: string;
  name: string;
  protein: number;
  fats: number;
  carbs: number;
  calories: number;
  link?: string;
}

interface MealPlan {
  [day: string]: {
    [meal: string]: Dish[];
  };
}

const DAYS = ['Понедельник', 'Вторник', 'Среда', 'Четверг', 'Пятница', 'Суббота', 'Воскресенье'];
const MEALS = ['Завтрак', 'Обед', 'Ужин', 'Перекус'];

const SAMPLE_DISHES: Dish[] = [
  { id: '1', name: 'Овсянка с ягодами', protein: 12, fats: 8, carbs: 45, calories: 310 },
  { id: '2', name: 'Куриная грудка с рисом', protein: 35, fats: 10, carbs: 50, calories: 430 },
  { id: '3', name: 'Греческий салат', protein: 8, fats: 15, carbs: 12, calories: 220 },
  { id: '4', name: 'Творог с мёдом', protein: 18, fats: 5, carbs: 20, calories: 195 },
];

export default function Index() {
  const [mealPlan, setMealPlan] = useState<MealPlan>({});
  const [dishDatabase, setDishDatabase] = useState<Dish[]>(() => {
    const saved = localStorage.getItem('dishDatabase');
    return saved ? JSON.parse(saved) : SAMPLE_DISHES;
  });
  const [activeTab, setActiveTab] = useState('planner');
  const [newDish, setNewDish] = useState<Partial<Dish>>({});

  useEffect(() => {
    localStorage.setItem('dishDatabase', JSON.stringify(dishDatabase));
  }, [dishDatabase]);

  const addDishToMeal = (day: string, meal: string, dish: Dish) => {
    setMealPlan(prev => ({
      ...prev,
      [day]: {
        ...prev[day],
        [meal]: [...(prev[day]?.[meal] || []), dish]
      }
    }));
  };

  const removeDishFromMeal = (day: string, meal: string, dishId: string) => {
    setMealPlan(prev => ({
      ...prev,
      [day]: {
        ...prev[day],
        [meal]: prev[day]?.[meal]?.filter(d => d.id !== dishId) || []
      }
    }));
  };

  const calculateDayTotals = (day: string) => {
    const dayMeals = mealPlan[day] || {};
    const totals = { protein: 0, fats: 0, carbs: 0, calories: 0 };
    
    Object.values(dayMeals).forEach(dishes => {
      dishes.forEach(dish => {
        totals.protein += dish.protein;
        totals.fats += dish.fats;
        totals.carbs += dish.carbs;
        totals.calories += dish.calories;
      });
    });
    
    return totals;
  };

  const calculateWeekTotals = () => {
    const totals = { protein: 0, fats: 0, carbs: 0, calories: 0 };
    
    DAYS.forEach(day => {
      const dayTotals = calculateDayTotals(day);
      totals.protein += dayTotals.protein;
      totals.fats += dayTotals.fats;
      totals.carbs += dayTotals.carbs;
      totals.calories += dayTotals.calories;
    });
    
    return totals;
  };

  const addNewDish = () => {
    if (newDish.name && newDish.protein !== undefined && newDish.fats !== undefined && 
        newDish.carbs !== undefined && newDish.calories !== undefined) {
      const dish: Dish = {
        id: Date.now().toString(),
        name: newDish.name,
        protein: newDish.protein,
        fats: newDish.fats,
        carbs: newDish.carbs,
        calories: newDish.calories,
        link: newDish.link
      };
      setDishDatabase(prev => [...prev, dish]);
      setNewDish({});
    }
  };

  const deleteDish = (dishId: string) => {
    setDishDatabase(prev => prev.filter(d => d.id !== dishId));
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto py-6 px-4">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-foreground mb-2">Планировщик питания</h1>
          <p className="text-muted-foreground">Составьте сбалансированный рацион на неделю</p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-4 mb-6">
            <TabsTrigger value="planner" className="flex items-center gap-2">
              <Icon name="Calendar" size={18} />
              Планировщик
            </TabsTrigger>
            <TabsTrigger value="database" className="flex items-center gap-2">
              <Icon name="Database" size={18} />
              База блюд
            </TabsTrigger>
            <TabsTrigger value="stats" className="flex items-center gap-2">
              <Icon name="BarChart3" size={18} />
              Статистика
            </TabsTrigger>
            <TabsTrigger value="ratios" className="flex items-center gap-2">
              <Icon name="Bookmark" size={18} />
              Мои рационы
            </TabsTrigger>
          </TabsList>

          <TabsContent value="planner" className="space-y-6">
            {DAYS.map(day => (
              <Card key={day} className="p-6 animate-fade-in">
                <h2 className="text-2xl font-semibold mb-4 flex items-center gap-2">
                  <Icon name="Calendar" size={24} className="text-primary" />
                  {day}
                </h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                  {MEALS.map(meal => (
                    <div key={meal} className="border rounded-lg p-4 bg-card">
                      <div className="flex items-center justify-between mb-3">
                        <h3 className="font-semibold text-lg">{meal}</h3>
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button size="sm" variant="ghost">
                              <Icon name="Plus" size={16} />
                            </Button>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>Добавить блюдо в {meal}</DialogTitle>
                            </DialogHeader>
                            <div className="space-y-2 max-h-96 overflow-y-auto">
                              {dishDatabase.map(dish => (
                                <Button
                                  key={dish.id}
                                  variant="outline"
                                  className="w-full justify-start"
                                  onClick={() => addDishToMeal(day, meal, dish)}
                                >
                                  <div className="flex-1 text-left">
                                    <div className="font-medium">{dish.name}</div>
                                    <div className="text-xs text-muted-foreground">
                                      Б: {dish.protein}г | Ж: {dish.fats}г | У: {dish.carbs}г | {dish.calories} ккал
                                    </div>
                                  </div>
                                </Button>
                              ))}
                            </div>
                          </DialogContent>
                        </Dialog>
                      </div>
                      
                      <div className="space-y-2">
                        {mealPlan[day]?.[meal]?.map(dish => (
                          <div key={dish.id} className="bg-muted/50 rounded p-2 text-sm relative group">
                            <Button
                              size="sm"
                              variant="ghost"
                              className="absolute top-1 right-1 h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                              onClick={() => removeDishFromMeal(day, meal, dish.id)}
                            >
                              <Icon name="X" size={14} />
                            </Button>
                            <div className="font-medium mb-1">{dish.name}</div>
                            <div className="text-xs text-muted-foreground space-y-0.5">
                              <div>Б: {dish.protein}г | Ж: {dish.fats}г | У: {dish.carbs}г</div>
                              <div className="font-semibold text-primary">{dish.calories} ккал</div>
                            </div>
                          </div>
                        )) || <div className="text-sm text-muted-foreground text-center py-4">Нет блюд</div>}
                      </div>
                    </div>
                  ))}
                </div>

                <div className="flex items-center gap-4 pt-4 border-t">
                  <div className="flex items-center gap-2 text-sm">
                    <span className="font-semibold">Итого за день:</span>
                  </div>
                  <div className="flex gap-4 text-sm">
                    <span className="font-medium">Б: <span className="text-secondary">{calculateDayTotals(day).protein}г</span></span>
                    <span className="font-medium">Ж: <span className="text-accent">{calculateDayTotals(day).fats}г</span></span>
                    <span className="font-medium">У: <span className="text-primary">{calculateDayTotals(day).carbs}г</span></span>
                    <span className="font-semibold text-lg">
                      <Icon name="Flame" size={16} className="inline text-destructive" /> {calculateDayTotals(day).calories} ккал
                    </span>
                  </div>
                </div>
              </Card>
            ))}

            <Card className="p-6 bg-gradient-to-r from-primary/10 to-secondary/10">
              <h2 className="text-2xl font-bold mb-4">Итого за неделю</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-card rounded-lg p-4 text-center">
                  <div className="text-3xl font-bold text-secondary">{calculateWeekTotals().protein}г</div>
                  <div className="text-sm text-muted-foreground mt-1">Белки</div>
                </div>
                <div className="bg-card rounded-lg p-4 text-center">
                  <div className="text-3xl font-bold text-accent">{calculateWeekTotals().fats}г</div>
                  <div className="text-sm text-muted-foreground mt-1">Жиры</div>
                </div>
                <div className="bg-card rounded-lg p-4 text-center">
                  <div className="text-3xl font-bold text-primary">{calculateWeekTotals().carbs}г</div>
                  <div className="text-sm text-muted-foreground mt-1">Углеводы</div>
                </div>
                <div className="bg-card rounded-lg p-4 text-center">
                  <div className="text-3xl font-bold text-destructive">{calculateWeekTotals().calories}</div>
                  <div className="text-sm text-muted-foreground mt-1">Калории</div>
                </div>
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="database" className="space-y-4">
            <Card className="p-6">
              <h2 className="text-2xl font-semibold mb-4">Добавить новое блюдо</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>Название блюда</Label>
                  <Input
                    placeholder="Овсянка с ягодами"
                    value={newDish.name || ''}
                    onChange={(e) => setNewDish(prev => ({ ...prev, name: e.target.value }))}
                  />
                </div>
                <div>
                  <Label>Ссылка на рецепт (необязательно)</Label>
                  <Input
                    placeholder="https://..."
                    value={newDish.link || ''}
                    onChange={(e) => setNewDish(prev => ({ ...prev, link: e.target.value }))}
                  />
                </div>
                <div>
                  <Label>Белки (г)</Label>
                  <Input
                    type="number"
                    placeholder="12"
                    value={newDish.protein || ''}
                    onChange={(e) => setNewDish(prev => ({ ...prev, protein: Number(e.target.value) }))}
                  />
                </div>
                <div>
                  <Label>Жиры (г)</Label>
                  <Input
                    type="number"
                    placeholder="8"
                    value={newDish.fats || ''}
                    onChange={(e) => setNewDish(prev => ({ ...prev, fats: Number(e.target.value) }))}
                  />
                </div>
                <div>
                  <Label>Углеводы (г)</Label>
                  <Input
                    type="number"
                    placeholder="45"
                    value={newDish.carbs || ''}
                    onChange={(e) => setNewDish(prev => ({ ...prev, carbs: Number(e.target.value) }))}
                  />
                </div>
                <div>
                  <Label>Калории</Label>
                  <Input
                    type="number"
                    placeholder="310"
                    value={newDish.calories || ''}
                    onChange={(e) => setNewDish(prev => ({ ...prev, calories: Number(e.target.value) }))}
                  />
                </div>
              </div>
              <Button onClick={addNewDish} className="mt-4">
                <Icon name="Plus" size={18} className="mr-2" />
                Добавить блюдо
              </Button>
            </Card>

            <Card className="p-6">
              <h2 className="text-2xl font-semibold mb-4">База блюд ({dishDatabase.length})</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {dishDatabase.map(dish => (
                  <div key={dish.id} className="border rounded-lg p-4 bg-card hover:shadow-lg transition-shadow relative group">
                    <Button
                      size="sm"
                      variant="ghost"
                      className="absolute top-2 right-2 h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity text-destructive hover:text-destructive hover:bg-destructive/10"
                      onClick={() => deleteDish(dish.id)}
                    >
                      <Icon name="Trash2" size={16} />
                    </Button>
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="font-semibold text-lg pr-8">{dish.name}</h3>
                      {dish.link && (
                        <a href={dish.link} target="_blank" rel="noopener noreferrer">
                          <Icon name="ExternalLink" size={16} className="text-primary" />
                        </a>
                      )}
                    </div>
                    <div className="space-y-1 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Белки:</span>
                        <span className="font-medium text-secondary">{dish.protein}г</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Жиры:</span>
                        <span className="font-medium text-accent">{dish.fats}г</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Углеводы:</span>
                        <span className="font-medium text-primary">{dish.carbs}г</span>
                      </div>
                      <div className="flex justify-between pt-2 border-t">
                        <span className="font-semibold">Калории:</span>
                        <span className="font-bold text-destructive">{dish.calories} ккал</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="stats" className="space-y-6">
            <Card className="p-6">
              <h2 className="text-2xl font-semibold mb-4">Распределение макронутриентов</h2>
              <div className="space-y-6">
                {DAYS.map(day => {
                  const totals = calculateDayTotals(day);
                  const totalMacros = totals.protein + totals.fats + totals.carbs;
                  const proteinPercent = totalMacros ? (totals.protein / totalMacros * 100).toFixed(1) : 0;
                  const fatsPercent = totalMacros ? (totals.fats / totalMacros * 100).toFixed(1) : 0;
                  const carbsPercent = totalMacros ? (totals.carbs / totalMacros * 100).toFixed(1) : 0;

                  return (
                    <div key={day}>
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-semibold">{day}</span>
                        <span className="text-sm text-muted-foreground">{totals.calories} ккал</span>
                      </div>
                      <div className="flex h-8 rounded-lg overflow-hidden">
                        <div 
                          className="bg-secondary flex items-center justify-center text-xs font-medium text-white"
                          style={{ width: `${proteinPercent}%` }}
                        >
                          {proteinPercent > 10 && `${proteinPercent}%`}
                        </div>
                        <div 
                          className="bg-accent flex items-center justify-center text-xs font-medium text-white"
                          style={{ width: `${fatsPercent}%` }}
                        >
                          {fatsPercent > 10 && `${fatsPercent}%`}
                        </div>
                        <div 
                          className="bg-primary flex items-center justify-center text-xs font-medium text-white"
                          style={{ width: `${carbsPercent}%` }}
                        >
                          {carbsPercent > 10 && `${carbsPercent}%`}
                        </div>
                      </div>
                      <div className="flex gap-4 mt-2 text-xs">
                        <span className="flex items-center gap-1">
                          <div className="w-3 h-3 bg-secondary rounded"></div>
                          Белки {totals.protein}г
                        </span>
                        <span className="flex items-center gap-1">
                          <div className="w-3 h-3 bg-accent rounded"></div>
                          Жиры {totals.fats}г
                        </span>
                        <span className="flex items-center gap-1">
                          <div className="w-3 h-3 bg-primary rounded"></div>
                          Углеводы {totals.carbs}г
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </Card>

            <Card className="p-6">
              <h2 className="text-2xl font-semibold mb-4">Средние показатели за день</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center">
                  <div className="text-3xl font-bold text-secondary">{(calculateWeekTotals().protein / 7).toFixed(1)}г</div>
                  <div className="text-sm text-muted-foreground mt-1">Белки</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-accent">{(calculateWeekTotals().fats / 7).toFixed(1)}г</div>
                  <div className="text-sm text-muted-foreground mt-1">Жиры</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-primary">{(calculateWeekTotals().carbs / 7).toFixed(1)}г</div>
                  <div className="text-sm text-muted-foreground mt-1">Углеводы</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-destructive">{Math.round(calculateWeekTotals().calories / 7)}</div>
                  <div className="text-sm text-muted-foreground mt-1">Калории</div>
                </div>
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="ratios" className="space-y-4">
            <Card className="p-6">
              <div className="text-center py-12">
                <Icon name="Bookmark" size={64} className="mx-auto text-muted-foreground mb-4" />
                <h2 className="text-2xl font-semibold mb-2">Мои рационы</h2>
                <p className="text-muted-foreground mb-4">Сохраните текущий план питания для быстрого доступа</p>
                <Button>
                  <Icon name="Save" size={18} className="mr-2" />
                  Сохранить текущий рацион
                </Button>
              </div>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}